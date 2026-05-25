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
        <Heading as="h3" style={h3}>Get Started — Next Steps</Heading>
        <ul style={listStyle}>
          <li style={listItem}>Log in to your student dashboard using the details above.</li>
          <li style={listItem}>Change your temporary password immediately after your first login.</li>
          <li style={listItem}>Explore your dashboard so you're ready when classes begin on <strong>June 12</strong>.</li>
          <li style={listItem}>Test your login access well before the first session so any issues can be resolved in time.</li>
        </ul>
        <Heading as="h3" style={h3}>Need Help Accessing the Platform?</Heading>
        <ul style={listStyle}>
          <li style={listItem}>Email: <a href="mailto:info@delvetek.io" style={{ color: '#D4A017' }}>info@delvetek.io</a></li>
          <li style={listItem}>WhatsApp: <a href="https://wa.me/447775739225" style={{ color: '#D4A017' }}>+44 7775 739225</a></li>
        </ul>
        <Button style={button} href="https://www.datadelve.io/auth">Log In to Your Dashboard</Button>
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
const h1 = { fontSize: '28px', fontWeight: 'bold' as const, fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A', margin: '0 0 20px' }
const h3 = { fontSize: '19px', fontWeight: 'bold' as const, color: '#1A1A1A', margin: '20px 0 12px' }
const text = { fontSize: '17px', color: '#333333', lineHeight: '1.6', margin: '0 0 16px' }
const detailText = { fontSize: '17px', color: '#333333', margin: '0 0 8px' }
const warningText = { fontSize: '16px', color: '#EF4444', margin: '10px 0 0', fontWeight: 'bold' as const }
const certText = { fontSize: '16px', color: '#22C55E', margin: '16px 0' }
const infoBox = { backgroundColor: '#F0F9FF', borderRadius: '8px', padding: '20px', margin: '20px 0' }
const scheduleBox = { backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '16px', margin: '20px 0' }
const button = { backgroundColor: '#D4A017', color: '#0D0D0D', fontSize: '17px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none' }
const listStyle = { fontSize: '17px', color: '#333333', lineHeight: '1.7', paddingLeft: '20px', margin: '0 0 20px' }
const listItem = { marginBottom: '8px' }
const footer = { fontSize: '14px', color: '#777777', margin: '30px 0 0' }
const footerBrand = { fontSize: '13px', color: '#999999', margin: '8px 0 0' }
