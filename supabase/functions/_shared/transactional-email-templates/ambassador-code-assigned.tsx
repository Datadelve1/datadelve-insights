/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "DelveTek"

interface AmbassadorCodeAssignedProps {
  fullName?: string
  code?: string
  trackingUrl?: string
}

const AmbassadorCodeAssignedEmail = ({ fullName, code, trackingUrl }: AmbassadorCodeAssignedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your DelveTek Ambassador referral code is ready</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome aboard, {fullName || 'Ambassador'} 🎉</Heading>
        <Text style={text}>
          Congratulations! You're now an official {SITE_NAME} Ambassador. Below is your unique referral code — share it with anyone you refer to {SITE_NAME}.
        </Text>

        <Section style={codeBox}>
          <Text style={codeLabel}>YOUR REFERRAL CODE</Text>
          <Text style={codeStyle}>{code || 'YOUR-CODE'}</Text>
        </Section>

        <Text style={text}>
          We've also created a private dashboard where you can track everyone who signs up with your code in real time. No login required — just keep this link safe.
        </Text>

        {trackingUrl && (
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button href={trackingUrl} style={button}>Open My Tracking Dashboard</Button>
            <Text style={smallLink}>{trackingUrl}</Text>
          </Section>
        )}

        <Text style={text}>
          <strong>How it works:</strong> When someone enrolls in any DelveTek cohort, they enter your code on the payment step. Each successful enrollment shows up on your dashboard.
        </Text>

        <Text style={text}>
          Need help or have questions? Reply to this email or reach us on WhatsApp at +44 7775 739225.
        </Text>

        <Text style={signoff}>– The DelveTek Team</Text>
        <Text style={footerBrand}>DELVETEK — Data Analytics & Tech Education</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AmbassadorCodeAssignedEmail,
  subject: 'Your DelveTek Ambassador Code & Tracking Link',
  displayName: 'Ambassador code assigned',
  previewData: {
    fullName: 'Jane Doe',
    code: 'JANE2026',
    trackingUrl: 'https://www.datadelve.io/track/JANE2026',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#555555', lineHeight: '1.8', margin: '0 0 16px' }
const codeBox = { backgroundColor: '#1A1A1A', borderRadius: '12px', padding: '24px', textAlign: 'center' as const, margin: '24px 0' }
const codeLabel = { fontSize: '11px', letterSpacing: '2px', color: '#FACC15', margin: '0 0 8px', fontWeight: 'bold' as const }
const codeStyle = { fontSize: '32px', fontWeight: 'bold' as const, color: '#FACC15', margin: 0, fontFamily: 'monospace', letterSpacing: '2px' }
const button = { backgroundColor: '#FACC15', color: '#1A1A1A', padding: '14px 28px', borderRadius: '10px', fontWeight: 'bold' as const, textDecoration: 'none', fontSize: '15px', display: 'inline-block' }
const smallLink = { fontSize: '12px', color: '#999999', margin: '12px 0 0', wordBreak: 'break-all' as const }
const signoff = { fontSize: '15px', color: '#1A1A1A', margin: '24px 0 0' }
const footerBrand = { fontSize: '11px', color: '#BBBBBB', margin: '24px 0 0' }
