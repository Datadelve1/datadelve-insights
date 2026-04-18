import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import { LogoHeader } from './_logo.tsx'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Delvetek"

interface StaffWelcomeProps {
  name?: string
  email?: string
  password?: string
  loginUrl?: string
}

const StaffWelcomeEmail = ({ name, email, password, loginUrl }: StaffWelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Delvetek Staff Portal login credentials</Preview>
    <Body style={main}>
      <Container style={container}>
        <LogoHeader />
        <Section style={headerSection}>
          <Heading style={h1}>Welcome to Delvetek Staff Portal</Heading>
        </Section>

        <Text style={text}>
          Hi {name || 'Team Member'},
        </Text>

        <Text style={text}>
          Your staff account has been created. Use the credentials below to log in to the Staff Time Tracking Portal.
        </Text>

        <Section style={credentialsBox}>
          <Text style={credLabel}>Email:</Text>
          <Text style={credValue}>{email || '—'}</Text>
          <Text style={credLabel}>Temporary Password:</Text>
          <Text style={credValue}>{password || '—'}</Text>
        </Section>

        <Text style={text}>
          You will be required to change your password on first login.
        </Text>

        <Section style={{ textAlign: 'center' as const, margin: '30px 0' }}>
          <Button style={button} href={loginUrl || 'https://datadelve.io/staff/login'}>
            Sign In Now
          </Button>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Best regards,<br />The {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: StaffWelcomeEmail,
  subject: 'Your Delvetek Staff Portal Login Credentials',
  displayName: 'Staff welcome',
  previewData: { name: 'Adewole', email: 'staff@example.com', password: '1234_!', loginUrl: 'https://datadelve.io/staff/login' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#0a0a0a', padding: '24px', borderRadius: '8px', marginBottom: '24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#facc15', margin: '0', textAlign: 'center' as const }
const text = { fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: '0 0 16px' }
const credentialsBox = { backgroundColor: '#f5f5f5', padding: '16px 20px', borderRadius: '8px', margin: '16px 0' }
const credLabel = { fontSize: '12px', color: '#888888', margin: '0 0 2px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const credValue = { fontSize: '16px', color: '#0a0a0a', fontWeight: 'bold' as const, margin: '0 0 12px' }
const button = { backgroundColor: '#facc15', color: '#0a0a0a', padding: '12px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' as const, textDecoration: 'none' }
const hr = { borderColor: '#eeeeee', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }
