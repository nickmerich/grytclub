import * as React from 'react'
import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'grytclub'
const SENDER_DOMAIN = 'notify.gryt.club'
const FROM_DOMAIN = 'notify.gryt.club'
const TEMPLATE_NAME = 'saturday-reminder'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function formatTimeLabel(t: string): string {
  const [hh, mm] = t.split(':')
  const h = Number(hh)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = ((h + 11) % 12) + 1
  return mm === '00' ? `${h12} ${suffix}` : `${h12}:${mm} ${suffix}`
}

/**
 * Cron: every Friday afternoon — send "tomorrow's run" reminders
 * to every RSVP'd email for the next-day event(s). Honors suppression
 * list and the per-profile email_reminders_enabled toggle. Idempotent
 * via idempotency_key = sat-reminder-{event.id}-{email}.
 *
 * Accepts optional body `{ targetDate: "YYYY-MM-DD" }` for testing;
 * defaults to tomorrow (UTC).
 */
export const Route = createFileRoute('/api/public/hooks/send-saturday-reminders')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = process.env.SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: 'Server misconfigured' }, { status: 500 })
        }
        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })

        let body: { targetDate?: string } = {}
        try {
          body = (await request.json()) ?? {}
        } catch {
          /* empty body ok */
        }

        // Default: tomorrow (UTC).
        const target = body.targetDate
          ? body.targetDate
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

        const { data: events, error: evErr } = await supabase
          .from('events')
          .select(
            'id, title, event_date, start_time, location_name, location_address, distance_mi, pace_label',
          )
          .eq('published', true)
          .eq('event_date', target)
          .order('start_time', { ascending: true })

        if (evErr) {
          return Response.json({ error: evErr.message }, { status: 500 })
        }
        if (!events || events.length === 0) {
          return Response.json({ ok: true, target, events: 0, sent: 0 })
        }

        // RSVPs are not tied to a specific event — pull the distinct
        // (name, email) list once and send per upcoming event.
        const { data: rsvps, error: rsvpErr } = await supabase
          .from('rsvps')
          .select('name, email')

        if (rsvpErr) {
          return Response.json({ error: rsvpErr.message }, { status: 500 })
        }

        const byEmail = new Map<string, { name: string; email: string }>()
        for (const r of rsvps ?? []) {
          const key = r.email.toLowerCase()
          if (!byEmail.has(key)) byEmail.set(key, { name: r.name, email: r.email })
        }
        const allEmails = Array.from(byEmail.keys())

        if (allEmails.length === 0) {
          return Response.json({ ok: true, target, events: events.length, sent: 0 })
        }

        const { data: suppressedRows } = await supabase
          .from('suppressed_emails')
          .select('email')
          .in('email', allEmails)
        const suppressed = new Set((suppressedRows ?? []).map((r) => r.email.toLowerCase()))

        const { data: optedOutRows, error: optErr } = await supabase.rpc(
          'emails_opted_out_of_reminders',
          { _emails: allEmails },
        )
        if (optErr) {
          console.error('opt-out lookup failed', optErr)
        }
        const optedOut = new Set((optedOutRows ?? []).map((r: { email: string }) => r.email))

        const template = TEMPLATES[TEMPLATE_NAME]
        let sent = 0
        let skipped = 0

        for (const ev of events) {
          const eventTimeLabel = formatTimeLabel(ev.start_time)
          for (const [normalized, { name, email }] of byEmail) {
            if (suppressed.has(normalized) || optedOut.has(normalized)) {
              skipped++
              continue
            }

            const idempotencyKey = `sat-reminder-${ev.id}-${normalized}`

            // Skip if we already logged a send for this idempotency key
            // (best-effort: status column is what process-email-queue updates).
            const { data: existingLog } = await supabase
              .from('email_send_log')
              .select('id')
              .eq('template_name', TEMPLATE_NAME)
              .eq('recipient_email', email)
              .gte('created_at', `${ev.event_date}T00:00:00Z`)
              .limit(1)
              .maybeSingle()
            if (existingLog) {
              skipped++
              continue
            }

            // Unsubscribe token (one per email, reuse if unused)
            let unsubscribeToken: string
            const { data: existingToken } = await supabase
              .from('email_unsubscribe_tokens')
              .select('token, used_at')
              .eq('email', normalized)
              .maybeSingle()
            if (existingToken && !existingToken.used_at) {
              unsubscribeToken = existingToken.token
            } else if (!existingToken) {
              unsubscribeToken = generateToken()
              await supabase
                .from('email_unsubscribe_tokens')
                .upsert(
                  { token: unsubscribeToken, email: normalized },
                  { onConflict: 'email', ignoreDuplicates: true },
                )
              const { data: stored } = await supabase
                .from('email_unsubscribe_tokens')
                .select('token')
                .eq('email', normalized)
                .maybeSingle()
              if (stored?.token) unsubscribeToken = stored.token
            } else {
              // Token used → recipient unsubscribed but not in suppression yet.
              skipped++
              continue
            }

            const data = {
              name,
              eventTitle: ev.title,
              eventTimeLabel,
              eventLocation: ev.location_name,
              eventAddress: ev.location_address,
              distanceMi: ev.distance_mi,
              paceLabel: ev.pace_label,
            }
            const element = React.createElement(template.component, data)
            const html = await render(element)
            const text = await render(element, { plainText: true })
            const subject =
              typeof template.subject === 'function'
                ? template.subject(data)
                : template.subject

            const messageId = crypto.randomUUID()
            await supabase.from('email_send_log').insert({
              message_id: messageId,
              template_name: TEMPLATE_NAME,
              recipient_email: email,
              status: 'pending',
            })

            const { error: enqueueError } = await supabase.rpc('enqueue_email', {
              queue_name: 'transactional_emails',
              payload: {
                message_id: messageId,
                to: email,
                from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
                sender_domain: SENDER_DOMAIN,
                subject,
                html,
                text,
                purpose: 'transactional',
                label: TEMPLATE_NAME,
                idempotency_key: idempotencyKey,
                unsubscribe_token: unsubscribeToken,
                queued_at: new Date().toISOString(),
              },
            })

            if (enqueueError) {
              console.error('enqueue failed', enqueueError)
              await supabase.from('email_send_log').insert({
                message_id: messageId,
                template_name: TEMPLATE_NAME,
                recipient_email: email,
                status: 'failed',
                error_message: 'Failed to enqueue',
              })
              continue
            }

            sent++
          }
        }

        return Response.json({
          ok: true,
          target,
          events: events.length,
          recipients: byEmail.size,
          sent,
          skipped,
        })
      },
    },
  },
})
