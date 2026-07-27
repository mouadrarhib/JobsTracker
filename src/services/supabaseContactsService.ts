import type { Contact, ContactInput, ContactStatus } from '../types'
import type { ContactsService } from './contactsService'
import { supabase } from './supabaseClient'

interface ContactRow {
  id: string
  name: string
  title: string
  company: string
  linkedin_url: string
  email: string
  phone: string
  application_id: string | null
  status: ContactStatus
  date_contacted: string | null
  notes: string
  date_last_updated: string
}

function fromRow(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    company: row.company,
    linkedinUrl: row.linkedin_url,
    email: row.email,
    phone: row.phone,
    applicationId: row.application_id,
    status: row.status,
    dateContacted: row.date_contacted ?? '',
    notes: row.notes,
    dateLastUpdated: row.date_last_updated,
  }
}

function toRow(input: Partial<ContactInput>) {
  const row: Record<string, unknown> = {}
  if (input.name !== undefined) row.name = input.name
  if (input.title !== undefined) row.title = input.title
  if (input.company !== undefined) row.company = input.company
  if (input.linkedinUrl !== undefined) row.linkedin_url = input.linkedinUrl
  if (input.email !== undefined) row.email = input.email
  if (input.phone !== undefined) row.phone = input.phone
  if (input.applicationId !== undefined) row.application_id = input.applicationId
  if (input.status !== undefined) row.status = input.status
  if (input.dateContacted !== undefined) row.date_contacted = input.dateContacted || null
  if (input.notes !== undefined) row.notes = input.notes
  return row
}

export const supabaseContactsService: ContactsService = {
  async getContacts() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('date_last_updated', { ascending: false })
    if (error) throw error
    return (data as ContactRow[]).map(fromRow)
  },

  async addContact(input) {
    const { data, error } = await supabase.from('contacts').insert(toRow(input)).select().single()
    if (error) throw error
    return fromRow(data as ContactRow)
  },

  async updateContact(id, patch) {
    const { data, error } = await supabase
      .from('contacts')
      .update(toRow(patch))
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return fromRow(data as ContactRow)
  },

  async deleteContact(id) {
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (error) throw error
  },
}
