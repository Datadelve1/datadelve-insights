/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as enrollmentWelcome } from './enrollment-welcome.tsx'
import { template as webinarConfirmation } from './webinar-confirmation.tsx'
import { template as ambassadorConfirmation } from './ambassador-confirmation.tsx'
import { template as commitmentConfirmation } from './commitment-confirmation.tsx'
import { template as weeklyReviewConfirmation } from './weekly-review-confirmation.tsx'
import { template as adminNotification } from './admin-notification.tsx'
import { template as staffWelcome } from './staff-welcome.tsx'
import { template as referrerNotification } from './referrer-notification.tsx'
import { template as adminWelcome } from './admin-welcome.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'enrollment-welcome': enrollmentWelcome,
  'webinar-confirmation': webinarConfirmation,
  'ambassador-confirmation': ambassadorConfirmation,
  'commitment-confirmation': commitmentConfirmation,
  'weekly-review-confirmation': weeklyReviewConfirmation,
  'admin-notification': adminNotification,
  'staff-welcome': staffWelcome,
  'referrer-notification': referrerNotification,
  'admin-welcome': adminWelcome,
}
