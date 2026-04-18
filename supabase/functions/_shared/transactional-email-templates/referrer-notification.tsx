/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { LogoHeader } from './_logo.tsx'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Delvetek"

interface ReferrerNotificationProps {
  referrerName?: string
  referralCode?: string
  studentName?: string
  track?: string
}

const ReferrerNotificationEmail = ({ referrerName, referralCode, studentName, track }: ReferrerNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>🎉 Someone just enrolled using your referral code</Preview>
    <Body style={main}>
      <Container style={container}>
        <LogoHeader />
        <Heading style={h1}>🎉 You earned a new referral!</Heading>
        <Text style={text}>Hi {referrerName || 'there'},</Text>
        <Text style={text}>
          Great news — <strong>{studentName || 'A new student'}</strong> just enrolled with {SITE_NAME}
          {track ? ` on the ${track} track` : ''} using your referral code <strong>{referralCode}</strong>.
        </Text>
        <Text style={text}>Thanks for spreading the word and helping more people grow into tech careers.</Text>
        <Text style={footerBrand}>— The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ReferrerNotificationEmail,
  subject: (data: Record<string, any>) => `🎉 New referral via your code ${data.referralCode || ''}`.trim(),
  displayName: 'Referrer notification',
  previewData: { referrerName: 'Jane', referralCode: 'JANE2026', studentName: 'John Doe', track: 'beginner' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '20px', fontWeight: 'bold' as const, color: '#1A1A1A', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '0 0 10px' }
const footerBrand = { fontSize: '11px', color: '#BBBBBB', margin: '24px 0 0' }
