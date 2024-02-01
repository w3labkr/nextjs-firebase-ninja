'use client'

import * as React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Link, { LinkProps } from 'next/link'
import type { SetOptional } from 'type-fest'
import { cn } from '@/utils'

type TransLinkProps = SetOptional<LinkProps, 'href'> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>

const Link1 = ({ children, ...props }: TransLinkProps) => (
  <Link
    href="/policy/terms"
    className="text-primary underline underline-offset-4"
    {...props}
  >
    {children}
  </Link>
)

const Link2 = ({ children, ...props }: TransLinkProps) => (
  <Link
    href="/policy/privacy"
    className="text-primary underline underline-offset-4"
    {...props}
  >
    {children}
  </Link>
)

export interface SignUpPolicyLinkProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

export function SignUpPolicyLink({
  className,
  ...props
}: SignUpPolicyLinkProps) {
  const { t } = useTranslation()

  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props}>
      <Trans t={t} components={{ link1: <Link1 />, link2: <Link2 /> }}>
        By clicking Sign Up, you agree to our Terms of Service and Privacy
        Policy
      </Trans>
    </p>
  )
}
