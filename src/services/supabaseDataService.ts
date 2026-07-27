import type { Application, ApplicationInput, Source, Status } from '../types'
import type { DataService } from './dataService'
import { supabase } from './supabaseClient'

interface ApplicationRow {
  id: string
  company_name: string
  role: string
  location: string
  job_url: string
  job_description: string
  score: number
  status: Status
  date_applied: string | null
  resume_version: string
  cover_letter_sent: boolean
  contact_person: string
  salary_range: string
  notes: string
  source: Source
  date_last_updated: string
}

function fromRow(row: ApplicationRow): Application {
  return {
    id: row.id,
    companyName: row.company_name,
    role: row.role,
    location: row.location,
    jobUrl: row.job_url,
    jobDescription: row.job_description,
    score: row.score,
    status: row.status,
    dateApplied: row.date_applied ?? '',
    dateLastUpdated: row.date_last_updated,
    resumeVersion: row.resume_version,
    coverLetterSent: row.cover_letter_sent,
    contactPerson: row.contact_person,
    salaryRange: row.salary_range,
    notes: row.notes,
    source: row.source,
  }
}

function toRow(input: Partial<ApplicationInput>) {
  const row: Record<string, unknown> = {}
  if (input.companyName !== undefined) row.company_name = input.companyName
  if (input.role !== undefined) row.role = input.role
  if (input.location !== undefined) row.location = input.location
  if (input.jobUrl !== undefined) row.job_url = input.jobUrl
  if (input.jobDescription !== undefined) row.job_description = input.jobDescription
  if (input.score !== undefined) row.score = input.score
  if (input.status !== undefined) row.status = input.status
  if (input.dateApplied !== undefined) row.date_applied = input.dateApplied || null
  if (input.resumeVersion !== undefined) row.resume_version = input.resumeVersion
  if (input.coverLetterSent !== undefined) row.cover_letter_sent = input.coverLetterSent
  if (input.contactPerson !== undefined) row.contact_person = input.contactPerson
  if (input.salaryRange !== undefined) row.salary_range = input.salaryRange
  if (input.notes !== undefined) row.notes = input.notes
  if (input.source !== undefined) row.source = input.source
  return row
}

export const supabaseDataService: DataService = {
  async getApplications() {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('date_last_updated', { ascending: false })
    if (error) throw error
    return (data as ApplicationRow[]).map(fromRow)
  },

  async getApplication(id) {
    const { data, error } = await supabase.from('applications').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data as ApplicationRow) : undefined
  },

  async addApplication(input) {
    const { data, error } = await supabase.from('applications').insert(toRow(input)).select().single()
    if (error) throw error
    return fromRow(data as ApplicationRow)
  },

  async updateApplication(id, patch) {
    const { data, error } = await supabase
      .from('applications')
      .update(toRow(patch))
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return fromRow(data as ApplicationRow)
  },

  async deleteApplication(id) {
    const { error } = await supabase.from('applications').delete().eq('id', id)
    if (error) throw error
  },

  async exportAll() {
    return this.getApplications()
  },

  async importAll(applications) {
    if (applications.length === 0) return
    const rows = applications.map((app) => toRow(app))
    const { error } = await supabase.from('applications').insert(rows)
    if (error) throw error
  },
}
