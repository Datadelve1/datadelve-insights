/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { LogoHeader } from './_logo.tsx'
import type { TemplateEntry } from './registry.ts'

interface CohortMoveProps {
  fullName?: string
  newCohort?: string
  previousCohort?: string
  track?: string
  classSchedule?: string
}

const TRACK_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  professional: 'Professional',
  advanced: 'Advanced',
}

const SCHEDULE_LABEL: Record<string, string> = {
  weekend: 'Weekend (Friday & Saturday)',
  weekday: 'Weekday (Monday & Wednesday)',
}

const CohortMoveNotificationEmail = ({
  fullName,
  newCohort,
  previousCohort,
  track,
  classSchedule,
}: CohortMoveProps) => {
  const trackLabel = TRACK_LABEL[(track || '').toLowerCase()] || track || '—'
  const scheduleLabel = SCHEDULE_LABEL[(classSchedule || '').toLowerCase()] || classSchedule || '—'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>You've been moved to {newCohort || 'a new cohort'} – Delvetek</Preview>
      <Body style={main}>
        <Container style={container}>
          <LogoHeader />
          <Heading style={h1}>Hi {fullName || 'Student'},</Heading>
          <Text style={text}>
            Good news — your enrollment has been updated. You've been moved
            {previousCohort ? ` from ${previousCohort}` : ''} to <strong>{newCohort || 'a new cohort'}</strong>.
          </Text>

          <Section style={infoBox}>
            <Text style={label}>Your new cohort details</Text>
            <Text style={row}><strong>Cohort:</strong> {newCohort}</Text>
            <Text style={row}><strong>Track:</strong> {trackLabel}</Text>
            <Text style={row}><strong>Class schedule:</strong> {scheduleLabel}</Text>
          </Section>

          <Text style={text}>
            <strong>Your login stays the same</strong> — no need to reset your password or sign up again.
            Just head to your dashboard at the usual link to access your new cohort's materials, classes, and assignments.
          </Text>

          <Text style={text}>
            If you have any questions, reach out to us at{' '}
            <a href="mailto:info@delvetek.io" style={link}>info@delvetek.io</a> or on WhatsApp at +44 7775 739225.
          </Text>

          <Text style={highlight}>See you in {newCohort || 'your new cohort'}! 🚀</Text>
          <Text style={signoff}>– Delvetek Team</Text>
          <Text style={footerBrand}>DELVETEK — Data Analytics & Tech Education</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: CohortMoveNotificationEmail,
  subject: (data: Record<string, any>) =>
    `You've been moved to ${data?.newCohort || 'a new cohort'} – Delvetek`,
  displayName: 'Cohort move notification',
  previewData: {
    fullName: 'Jane Doe',
    newCohort: 'Cohort 2',
    previousCohort: 'Cohort 1',
    track: 'professional',
    classSchedule: 'weekend',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#555555', lineHeight: '1.8', margin: '0 0 16px' }
const label = { fontSize: '12px', color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 10px', fontWeight: '600' as const }
const row = { fontSize: '15px', color: '#1A1A1A', lineHeight: '1.6', margin: '0 0 6px' }
const highlight = { fontSize: '16px', color: '#D4A017', fontWeight: '600' as const, margin: '20px 0 0' }
const signoff = { fontSize: '15px', color: '#1A1A1A', margin: '16px 0 0' }
const infoBox = { backgroundColor: '#FAFAF7', borderRadius: '12px', padding: '24px', border: '1px solid #E8E0D4', margin: '0 0 20px' }
const link = { color: '#D4A017', textDecoration: 'underline' }
const footerBrand = { fontSize: '11px', color: '#BBBBBB', margin: '24px 0 0' }
