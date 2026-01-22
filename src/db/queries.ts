import { asc, eq } from 'drizzle-orm'
import { contacts, faqs, techStack } from './schema'
import { db } from './index'

export async function getFaqs() {
  return await db.select().from(faqs).where(eq(faqs.isVisible, true)).orderBy(asc(faqs.order))
}

export async function getTechStack() {
  return await db.select().from(techStack).where(eq(techStack.isVisible, true)).orderBy(asc(techStack.order))
}

export async function getContacts() {
  return await db.select().from(contacts).where(eq(contacts.isVisible, true)).orderBy(asc(contacts.order))
}
