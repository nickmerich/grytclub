import type { ComponentType } from 'react'
import { template as rsvpConfirmation } from './rsvp-confirmation'
import { template as saturdayReminder } from './saturday-reminder'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'rsvp-confirmation': rsvpConfirmation,
  'saturday-reminder': saturdayReminder,
}
