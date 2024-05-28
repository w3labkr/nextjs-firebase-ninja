'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'

import { useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

import { useSWRConfig } from 'swr'
import { fetcher } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useNotificationAPI } from '@/queries/client/notifications'
import { NotificationAPI } from '@/types/api'

const FormSchema = z.object({
  marketing_emails: z.boolean(),
  security_emails: z.boolean().refine((val) => val === true),
})

type FormValues = z.infer<typeof FormSchema>

const NotificationsForm = () => {
  const { user } = useAuth()
  const { notification } = useNotificationAPI(user?.id ?? null)

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: 'onSubmit',
    values: {
      marketing_emails: notification?.marketing_emails ?? false,
      security_emails: true,
    },
  })

  return (
    <Form {...form}>
      <form method="POST" noValidate className="space-y-4">
        <MarketingEmailsField />
        <SecurityEmailsField />
        <SubmitButton />
      </form>
    </Form>
  )
}

const MarketingEmailsField = () => {
  const { t } = useTranslation()
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name="marketing_emails"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              {t('NotificationsForm.marketing_emails.label')}
            </FormLabel>
            <FormDescription>
              {t('NotificationsForm.marketing_emails.description')}
            </FormDescription>
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  )
}

const SecurityEmailsField = () => {
  const { t } = useTranslation()
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name="security_emails"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              {t('NotificationsForm.security_emails.label')}
            </FormLabel>
            <FormDescription>
              {t('NotificationsForm.security_emails.description')}
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled
              aria-readonly
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}

const SubmitButton = () => {
  const { t } = useTranslation()
  const { handleSubmit, getValues } = useFormContext()
  const { user } = useAuth()
  const { notification } = useNotificationAPI(user?.id ?? null)
  const { mutate } = useSWRConfig()

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)

  const onSubmit = async () => {
    try {
      setIsSubmitting(true)

      const formValues = getValues()

      if (!user) throw new Error('Require is not defined.')
      if (!notification) throw new Error('Require is not defined.')
      if (formValues?.marketing_emails === notification?.marketing_emails) {
        throw new Error('Nothing has changed.')
      }

      const fetchUrl = `/api/v1/notification?userId=${user?.id}`
      const result = await fetcher<NotificationAPI>(fetchUrl, {
        method: 'POST',
        body: JSON.stringify({
          data: formValues,
        }),
      })

      if (result?.error) throw new Error(result?.error?.message)

      mutate(fetchUrl)

      toast.success(t('FormMessage.changed_successfully'))
    } catch (e: unknown) {
      const err = (e as Error)?.message
      if (err.startsWith('Nothing has changed')) {
        toast(t('FormMessage.nothing_has_changed'))
      } else {
        toast.error(err)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Button
      type="submit"
      onClick={handleSubmit(onSubmit)}
      disabled={isSubmitting}
    >
      {t('FormSubmit.update_notifications')}
    </Button>
  )
}

export { NotificationsForm }
