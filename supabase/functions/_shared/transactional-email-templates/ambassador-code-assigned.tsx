/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { LogoHeader } from './_logo.tsx'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "DelveTek"
const WELCOME_PACK_URL = "https://cszwkukwkcrecirbvvee.supabase.co/storage/v1/object/public/ambassador-assets/delvetek-ambassador-welcome-pack.pdf"

interface AmbassadorCodeAssignedProps {
  fullName?: string
  code?: string
  trackingUrl?: string
}

const AmbassadorCodeAssignedEmail = ({ fullName, code, trackingUrl }: AmbassadorCodeAssignedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your DelveTek Ambassador referral code & welcome pack are ready</Preview>
    <Body style={main}>
      <Container style={container}>
        <LogoHeader />
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

        <Section style={packBox}>
          <Text style={packLabel}>📎 ATTACHED: AMBASSADOR WELCOME PACK</Text>
          <Text style={packText}>
            We've put together a Welcome Pack that explains your role as an Ambassador in detail and gives you ready-to-use templates and talking points for speaking with people you'd like to refer. Use it as your go-to guide when reaching out.
          </Text>
          <Button href={WELCOME_PACK_URL} style={packButton}>Download Welcome Pack (PDF)</Button>
        </Section>

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
const packBox = { backgroundColor: '#FFFBEB', border: '1px solid #FACC15', borderRadius: '12px', padding: '20px', margin: '24px 0', textAlign: 'center' as const }
const packLabel = { fontSize: '11px', letterSpacing: '1.5px', color: '#1A1A1A', margin: '0 0 10px', fontWeight: 'bold' as const }
const packText = { fontSize: '14px', color: '#555555', lineHeight: '1.7', margin: '0 0 16px', textAlign: 'left' as const }
const packButton = { backgroundColor: '#1A1A1A', color: '#FACC15', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold' as const, textDecoration: 'none', fontSize: '14px', display: 'inline-block' }
const signoff = { fontSize: '15px', color: '#1A1A1A', margin: '24px 0 0' }
const footerBrand = { fontSize: '11px', color: '#BBBBBB', margin: '24px 0 0' }
