/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { LogoHeader } from './_logo.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { taskTitle?: string; completedBy?: string; completedAt?: string; dueDate?: string; detail?: string }

const OpsTaskCompletedEmail = ({ taskTitle, completedBy, completedAt, dueDate, detail }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>✅ Task done: {taskTitle || 'Ops task'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <LogoHeader />
        <Heading style={h1}>✅ Task completed</Heading>
        <Text style={text}><strong>Task:</strong> {taskTitle || '—'}</Text>
        <Text style={text}><strong>Done by:</strong> {completedBy || '—'}</Text>
        {dueDate && <Text style={text}><strong>Due date:</strong> {dueDate}</Text>}
        {completedAt && <Text style={text}><strong>Completed:</strong> {completedAt}</Text>}
        {detail && <Text style={text}><strong>Details:</strong> {detail}</Text>}
        <Text style={footerBrand}>Delvetek Ops Centre</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OpsTaskCompletedEmail,
  subject: (data: Record<string, any>) => `✅ Done: ${data.taskTitle || 'Ops task'}`,
  displayName: 'Ops task completed',
  to: 'oloyedeopeyemi253@gmail.com',
  previewData: { taskTitle: 'Cohort 4 — Beginner Recording & Assignment Uploaded (Week 1 - Saturday)', completedBy: 'David Gbadebo', completedAt: 'Nov 21, 2026 10:15 PM', dueDate: 'Nov 21, 2026', detail: 'Email sent to 6 students' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '20px', fontWeight: 'bold' as const, color: '#1A1A1A', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '0 0 10px' }
const footerBrand = { fontSize: '11px', color: '#BBBBBB', margin: '24px 0 0' }
