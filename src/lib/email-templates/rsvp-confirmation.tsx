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
}

const Email = ({ name }: Props) => {
  const first = name?.split(' ')[0] || 'friend'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>You're in for Saturday. 7 AM. Trailhead.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={meta}>● GRYT CLUB</Text>
          <Hr style={rule} />
          <Heading style={h1}>You're in, {first}.</Heading>
          <Text style={lead}>
            See you Saturday. <strong>7 AM sharp.</strong> Trailhead.
          </Text>
          <Section style={card}>
            <Text style={cardLabel}>WHAT TO BRING</Text>
            <Text style={cardBody}>
              Trail shoes. Water. A layer you don't mind sweating in. That's it.
            </Text>
          </Section>
          <Text style={p}>
            We'll send a heads-up before Saturday with the exact meet spot. If
            something comes up, just reply to this email.
          </Text>
          <Hr style={rule} />
          <Text style={footer}>
            Reading about it is fine. Showing up is the real thing.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: "You're in — Saturday, 7 AM",
  displayName: 'RSVP Confirmation',
  previewData: { name: 'Jane Doe' },
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
const rule = {
  borderColor: '#2a2a2c',
  margin: '16px 0 24px',
}
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
const card = {
  border: '1px solid #89cff0',
  padding: '18px 20px',
  margin: '0 0 24px',
}
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
