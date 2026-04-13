/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "DelveTek"

interface WeeklyReviewConfirmationProps { fullName?: string; weekNumber?: number }

const WeeklyReviewConfirmationEmail = ({ fullName, weekNumber }: WeeklyReviewConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Thank You for Your Weekly Reflection – DelveTek</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Hello {fullName || 'Student'},</Heading>
        <Section style={infoBox}>
          <Text style={text}>Thank you for submitting your reflection for <strong>Week {weekNumber || '?'}</strong>. Your submission has been successfully recorded.</Text>
          <Text style={text}>Your consistent participation helps you stay on track and ensures eligibility for certificates, references, and future programs.</Text>
        </Section>
        <Text style={highlight}>Keep up the great work! 💪</Text>
        <Text style={signoff}>– DelveTek Team</Text>
        <Text style={footerBrand}>DELVETEK — Data Analytics & Tech Education</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WeeklyReviewConfirmationEmail,
  subject: (data: Record<string, any>) => `Thank You for Your Week ${data.weekNumber || ''} Reflection – DelveTek`,
  displayName: 'Weekly review confirmation',
  previewData: { fullName: 'Jane Doe', weekNumber: 3 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#555555', lineHeight: '1.8', margin: '0 0 16px' }
const highlight = { fontSize: '16px', color: '#D4A017', fontWeight: '600' as const, margin: '20px 0 0' }
const signoff = { fontSize: '15px', color: '#1A1A1A', margin: '16px 0 0' }
const infoBox = { backgroundColor: '#FAFAF7', borderRadius: '12px', padding: '24px', border: '1px solid #E8E0D4', margin: '0 0 20px' }
const footerBrand = { fontSize: '11px', color: '#BBBBBB', margin: '24px 0 0' }
