/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Img, Section } from 'npm:@react-email/components@0.0.22'

export const DELVETEK_LOGO_URL =
  'https://cszwkukwkcrecirbvvee.supabase.co/storage/v1/object/public/form-uploads/brand/delvetek-email-logo.png'

export const LogoHeader = () => (
  <Section style={{ textAlign: 'center', padding: '24px 0 8px' }}>
    <Img
      src={DELVETEK_LOGO_URL}
      width="56"
      height="56"
      alt="Delvetek"
      style={{ display: 'inline-block', borderRadius: '12px' }}
    />
  </Section>
)
