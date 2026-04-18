/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { LogoHeader } from './_logo.tsx'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "DelveTek"

interface EnrollmentWelcomeProps {
  fullName?: string
  email?: string
  password?: string
  track?: string
  classSchedule?: string
  certificateRequested?: boolean
}

const EnrollmentWelcomeEmail = ({ fullName, email, password, track, classSchedule, certificateRequested }: EnrollmentWelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to DelveTek Cohort 2 — Your Login Details</Preview>
    <Body style={main}>
      <Container style={container}>
        <LogoHeader />
        <Heading style={h1}>Welcome to DelveTek, {fullName || 'Student'}! 🎉</Heading>
        <Text style={text}>Your enrollment in the <strong>{track ? track.charAt(0).toUpperCase() + track.slice(1) : 'Beginner'} Track</strong> (Cohort 2) has been confirmed.</Text>
        <Section style={infoBox}>
          <Heading as="h3" style={h3}>Your Login Details</Heading>
          <Text style={detailText}><strong>Email:</strong> {email}</Text>
          <Text style={detailText}><strong>Temporary Password:</strong> {password}</Text>
          <Text style={warningText}>⚠️ You MUST change your password on first login.</Text>
        </Section>
        <Section style={scheduleBox}>
          <Heading as="h3" style={h3}>Your Class Schedule</Heading>
          <Text style={detailText}>{classSchedule === 'weekday' ? '📅 Weekday: Monday & Wednesday, 5:00 PM – 8:00 PM' : '📅 Weekend: Friday & Saturday, 6:00 PM – 9:00 PM'}</Text>
        </Section>
        <Text style={text}><strong>Step 1:</strong> Log in to your student dashboard.</Text>
        <Text style={text}><strong>Step 2:</strong> Change your password immediately.</Text>
        <Text style={text}><strong>Step 3:</strong> Explore your dashboard — classes start June 5!</Text>
        <Button style={button} href="https://delvetek.io/auth">Log In to Your Dashboard</Button>
        {certificateRequested && <Text style={certText}>✅ Certificate payment included — it will be issued upon program completion.</Text>}
        <Text style={footer}>Need help? Contact us at info@delvetek.io</Text>
        <Text style={footerBrand}>DELVETEK — Data Analytics & Tech Education</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: EnrollmentWelcomeEmail,
  subject: 'Welcome to DelveTek Cohort 2 — Your Login Details',
  displayName: 'Enrollment welcome',
  previewData: { fullName: 'Jane Doe', email: 'jane@example.com', password: 'TempPass123!', track: 'beginner', classSchedule: 'weekend', certificateRequested: true },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A', margin: '0 0 20px' }
const h3 = { fontSize: '16px', fontWeight: 'bold' as const, color: '#1A1A1A', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '0 0 16px' }
const detailText = { fontSize: '14px', color: '#333333', margin: '0 0 6px' }
const warningText = { fontSize: '13px', color: '#EF4444', margin: '8px 0 0' }
const certText = { fontSize: '13px', color: '#22C55E', margin: '16px 0' }
const infoBox = { backgroundColor: '#F0F9FF', borderRadius: '8px', padding: '20px', margin: '20px 0' }
const scheduleBox = { backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '16px', margin: '20px 0' }
const button = { backgroundColor: '#D4A017', color: '#0D0D0D', fontSize: '14px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '12px 24px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
const footerBrand = { fontSize: '11px', color: '#BBBBBB', margin: '8px 0 0' }
