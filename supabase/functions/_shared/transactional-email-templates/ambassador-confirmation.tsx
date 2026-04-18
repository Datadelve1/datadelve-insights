/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { LogoHeader } from './_logo.tsx'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "DelveTek"

interface AmbassadorConfirmationProps { fullName?: string }

const AmbassadorConfirmationEmail = ({ fullName }: AmbassadorConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Thank you for your Ambassador Application – DelveTek</Preview>
    <Body style={main}>
      <Container style={container}>
        <LogoHeader />
        <Heading style={h1}>Hello {fullName || 'Applicant'},</Heading>
        <Section style={infoBox}>
          <Text style={text}>Thank you for submitting your Ambassador Program Application. Your application has been successfully received and is under review.</Text>
          <Text style={text}>The DelveTek team will carefully evaluate all submissions and contact selected candidates regarding next steps.</Text>
          <Text style={text}>We appreciate your interest and commitment to becoming a DelveTek Ambassador.</Text>
        </Section>
        <Text style={signoff}>– DelveTek Team</Text>
        <Text style={footerBrand}>DELVETEK — Data Analytics & Tech Education</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AmbassadorConfirmationEmail,
  subject: 'Thank You for Your Ambassador Application – DelveTek',
  displayName: 'Ambassador confirmation',
  previewData: { fullName: 'Jane Doe' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#555555', lineHeight: '1.8', margin: '0 0 16px' }
const signoff = { fontSize: '15px', color: '#1A1A1A', margin: '24px 0 0' }
const infoBox = { backgroundColor: '#FAFAF7', borderRadius: '12px', padding: '24px', border: '1px solid #E8E0D4', margin: '0 0 20px' }
const footerBrand = { fontSize: '11px', color: '#BBBBBB', margin: '24px 0 0' }
