import { SiteConfig, MobileSiteConfig } from '@/types'

export const siteConfig: SiteConfig = {
  name: 'Acme Inc',
  title: 'Create Next App',
  description: 'Generated by create next app',
  symbol: 'Mountain', // LucideIcon
}

export const mobileSiteConfig: MobileSiteConfig = {
  name: 'Acme Inc',
  title: 'Create Next App',
  description: 'Generated by create next app',
  symbol: 'Mountain', // LucideIcon
  nav: [
    { id: 1, title: 'home', href: '/', translate: 'yes' },
    { id: 2, title: 'pricing', href: '#', translate: 'yes' },
    { id: 3, title: 'contact_us', href: '#', translate: 'yes' },
  ],
}
