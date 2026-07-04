/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { LogoHeader } from './_logo.tsx'
import type { TemplateEntry } from './registry.ts'

interface OpsCustomProps {
  subject?: string
  body?: string
  firstName?: string
}

// Splits body into paragraphs on blank lines for basic formatting.
const OpsCustomEmail = ({ subject, body, firstName }: OpsCustomProps) => {
  const paragraphs = (body || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{subject || 'Update from Delvetek'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <LogoHeader />
          {firstName ? <Heading style={h1}>Hello {firstName},</Heading> : null}
          <Section style={infoBox}>
            {paragraphs.length === 0
              ? <Text style={text}>{body}</Text>
              : paragraphs.map((p, i) => (
                  <Text key={i} style={text}>
                    {p.split('\n').map((line, j) => (
                      <React.Fragment key={j}>
                        {line}
                        {j < p.split('\n').length - 1 ? <br /> : null}
                      </React.Fragment>
                    ))}
                  </Text>
                ))}
          </Section>
          <Text style={signoff}>– The Delvetek Team</Text>
          <Text style={footerBrand}>DELVETEK — Data Analytics & Tech Education</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: OpsCustomEmail,
  subject: (data: Record<string, any>) => data?.subject || 'Update from Delvetek',
  displayName: 'Ops custom email',
  previewData: { subject: 'Sample subject', body: 'Hello,\n\nThis is a sample email body.', firstName: 'Jane' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.8', margin: '0 0 16px' }
const signoff = { fontSize: '15px', color: '#1A1A1A', margin: '16px 0 0' }
const infoBox = { backgroundColor: '#FAFAF7', borderRadius: '12px', padding: '24px', border: '1px solid #E8E0D4', margin: '0 0 20px' }
const footerBrand = { fontSize: '11px', color: '#BBBBBB', margin: '24px 0 0' }
