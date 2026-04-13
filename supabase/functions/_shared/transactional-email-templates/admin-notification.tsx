/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "DelveTek"

interface AdminNotificationProps { type?: string; name?: string; email?: string; detail?: string }

const AdminNotificationEmail = ({ type, name, email, detail }: AdminNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>🔔 New {type || 'Action'}: {name || email || 'Unknown'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🔔 {type || 'New Notification'}</Heading>
        {name && <Text style={text}><strong>Name:</strong> {name}</Text>}
        {email && <Text style={text}><strong>Email:</strong> {email}</Text>}
        {detail && <Text style={text}><strong>Details:</strong> {detail}</Text>}
        <Text style={text}><strong>Date:</strong> {new Date().toLocaleString()}</Text>
        <Text style={footerBrand}>DELVETEK Admin Notification</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminNotificationEmail,
  subject: (data: Record<string, any>) => `🔔 ${data.type || 'Notification'}: ${data.name || data.email || ''}`,
  displayName: 'Admin notification',
  to: 'info@datadelve.io',
  previewData: { type: 'New Enrollment', name: 'Jane Doe', email: 'jane@example.com', detail: 'Beginner Track' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '20px', fontWeight: 'bold' as const, color: '#1A1A1A', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '0 0 10px' }
const footerBrand = { fontSize: '11px', color: '#BBBBBB', margin: '24px 0 0' }
