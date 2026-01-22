import { createServerFn } from '@tanstack/react-start'
import { getContacts, getFaqs, getTechStack } from '@/db/queries'

export const getLandingData = createServerFn({ method: 'GET' })
  .handler(async () => {
    const [faqs, stack, contacts] = await Promise.all([
      getFaqs(),
      getTechStack(),
      getContacts(),
    ])
    return { faqs, stack, contacts }
  })
