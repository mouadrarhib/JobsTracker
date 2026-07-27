import type { Contact, ContactInput } from '../types'

export interface ContactsService {
  getContacts(): Promise<Contact[]>
  addContact(input: ContactInput): Promise<Contact>
  updateContact(id: string, patch: Partial<ContactInput>): Promise<Contact>
  deleteContact(id: string): Promise<void>
}

import { supabaseContactsService } from './supabaseContactsService'

export const contactsService: ContactsService = supabaseContactsService
