/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { LogoHeader } from './_logo.tsx'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "DelveTek"

interface WebinarConfirmationProps { email?: string }

const WebinarConfirmationEmail = ({ email }: WebinarConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're registered for the DelveTek Webinar! 🎉</Preview>
    <Body style={main}>
      <Container style={container}>
        <LogoHeader />
        <Heading style={h1}>You're In! 🎉</Heading>
        <Text style={subhead}>Your spot has been reserved</Text>
        <Section style={infoBox}>
          <Heading as="h3" style={h3}>Stop Learning Tech — Unless You Want To Stay Relevant</Heading>
          <Text style={detailText}>📅 <strong>Date:</strong> 28th March, 2026</Text>
          <Text style={detailText}>🕗 <strong>Time:</strong> 8:00 PM (GMT+1)</Text>
          <Text style={detailText}>📍 <strong>Location:</strong> Online — Free</Text>
        </Section>
        <Section style={speakerBox}>
          <Text style={speakerLabel}>Your Speakers</Text>
          <Text style={detailText}><strong>Pipeloluwa Oshinubi</strong> — Data Analyst & Co-Founder (Host)</Text>
          <Text style={detailText}><strong>Tobi Anifowose</strong> — Senior Software Engineer (Guest)</Text>
        </Section>
        <Button style={button} href="https://meet.google.com/imz-pqyp-kib">Join Webinar</Button>
        <Text style={text}>We'll send you a reminder before the event. See you there! 👋</Text>
        <Text style={footerBrand}>DELVETEK — Data Analytics & Tech Education</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WebinarConfirmationEmail,
  subject: "You're Registered! 🎉 Stop Learning Tech Webinar",
  displayName: 'Webinar confirmation',
  previewData: { email: 'student@example.com' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A', margin: '0 0 8px' }
const h3 = { fontSize: '18px', fontWeight: 'bold' as const, color: '#1A1A1A', margin: '0 0 16px' }
const subhead = { fontSize: '14px', color: '#777', margin: '0 0 24px' }
const text = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '16px 0' }
const detailText = { fontSize: '14px', color: '#333333', margin: '0 0 4px' }
const speakerLabel = { fontSize: '14px', fontWeight: 'bold' as const, color: '#D4A017', margin: '0 0 8px' }
const infoBox = { backgroundColor: '#FAFAF7', borderRadius: '12px', padding: '24px', border: '1px solid #E8E0D4', margin: '0 0 20px' }
const speakerBox = { backgroundColor: '#FAFAF7', borderRadius: '12px', padding: '20px', border: '1px solid #E8E0D4', margin: '0 0 24px' }
const button = { backgroundColor: '#D4A017', color: '#0D0D0D', fontSize: '14px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '12px 24px', textDecoration: 'none' }
const footerBrand = { fontSize: '11px', color: '#BBBBBB', margin: '24px 0 0' }
