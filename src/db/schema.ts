import { boolean, integer, json, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

type LocalizedString = Record<string, string>

export const todos = pgTable('todos', {
    id: serial().primaryKey(),
    title: text().notNull(),
    createdAt: timestamp('created_at').defaultNow(),
})

export const faqs = pgTable('faqs', {
    id: serial('id').primaryKey(),
    question: json('question').$type<LocalizedString>().notNull(),
    answer: json('answer').$type<LocalizedString>().notNull(),
    order: integer('order').default(0),
    isVisible: boolean('is_visible').default(true),
})

export const techStack = pgTable('tech_stack', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    category: json('category').$type<LocalizedString>(),
    order: integer('order').default(0),
    isVisible: boolean('is_visible').default(true),
})

export const contacts = pgTable('contacts', {
    id: serial('id').primaryKey(),
    type: text('type').notNull(),
    value: text('value').notNull(),
    link: text('link').notNull(),
    label: json('label').$type<LocalizedString>(),
    description: json('description').$type<LocalizedString>(),
    order: integer('order').default(0),
    isVisible: boolean('is_visible').default(true),
})
