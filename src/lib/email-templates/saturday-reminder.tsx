import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  eventTitle?: string
  eventTimeLabel?: string
  eventLocation?: string
  eventAddress?: string | null
  distanceMi?: number | null
  paceLabel?: string | null
}

const Email = ({
  name,
  eventTitle = 'Saturday run',
  eventTimeLabel = '7 AM',
  eventLocation = 'Trailhead',
  eventAddress = null,
  distanceMi = null,
  paceLabel = null,
}: Props) => {
  const first = name?.split(' ')[0] || 'friend'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`Tomorrow. ${eventTimeLabel}. ${eventLocation}.`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={meta}>● GRYT CLUB · TOMORROW</Text>
          <Hr style={rule} />
          <Heading style={h1}>{first}, you're up tomorrow.</Heading>
          <Text style={lead}>
            <strong>{eventTitle}</strong> — {eventTimeLabel} at {eventLocation}.
          </Text>
          <Section style={card}>
            <Text style={cardLabel}>THE DETAILS</Text>
            <Text style={cardBody}>
              {eventTimeLabel} · {eventLocation}
              {eventAddress ? <><br />{eventAddress}</> : null}
              {distanceMi != null ? <><br />~{distanceMi} mi</> : null}
              {paceLabel ? <> · {paceLabel}</> : null}
            </Text>
          </Section>
          <Text style={p}>
            Shoes by the door. Water in the bottle. Show up — that's the whole
            thing.
          </Text>
          <Text style={p}>
            Can't make it? No drama. Just reply and let the host know.
          </Text>
          <Hr style={rule} />
          <Text style={footer}>See you out there.</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Tomorrow — ${data.eventTimeLabel ?? '7 AM'} at ${data.eventLocation ?? 'the trailhead'}`,
  displayName: 'Saturday Run Reminder',
  previewData: {
    name: 'Jane Doe',
    eventTitle: 'Saturday Trailhead Run',
    eventTimeLabel: '7 AM',
    eventLocation: 'Trailhead',
    eventAddress: '123 Trail Rd',
    distanceMi: 5,
    paceLabel: 'All paces',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  margin: 0,
  padding: 0,
}
const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 28px',
  backgroundColor: '#0b0b0c',
  color: '#f5efe6',
}
const meta = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  color: '#89cff0',
  margin: 0,
  textTransform: 'uppercase' as const,
}
const rule = { borderColor: '#2a2a2c', margin: '16px 0 24px' }
const h1 = {
  fontSize: '32px',
  lineHeight: '1.1',
  fontWeight: 800,
  letterSpacing: '-0.01em',
  margin: '0 0 12px',
  color: '#ffffff',
}
const lead = {
  fontSize: '18px',
  lineHeight: '1.4',
  color: '#f5efe6',
  margin: '0 0 28px',
}
const card = { border: '1px solid #89cff0', padding: '18px 20px', margin: '0 0 24px' }
const cardLabel = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  color: '#89cff0',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
}
const cardBody = {
  fontSize: '15px',
  lineHeight: '1.5',
  color: '#f5efe6',
  margin: 0,
}
const p = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#cfc8bd',
  margin: '0 0 16px',
}
const footer = {
  fontSize: '12px',
  color: '#7d766c',
  margin: 0,
  fontStyle: 'italic' as const,
}
