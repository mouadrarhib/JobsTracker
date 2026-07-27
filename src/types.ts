export const STATUSES = [
  'Wishlist',
  'Applied',
  'Phone Screen',
  'Interview',
  'Technical Test',
  'Offer',
  'Rejected',
  'Withdrawn',
] as const

export type Status = (typeof STATUSES)[number]

export const SOURCES = [
  'LinkedIn',
  'Company Site',
  'Referral',
  'Indeed',
  'ReKrute',
  'MarocAnnonces',
  'Networking Event',
  'Other',
] as const

export type Source = (typeof SOURCES)[number]

export interface Application {
  id: string
  companyName: string
  role: string
  location: string
  jobUrl: string
  jobDescription: string
  score: number
  status: Status
  dateApplied: string
  dateLastUpdated: string
  resumeVersion: string
  coverLetterSent: boolean
  contactPerson: string
  salaryRange: string
  notes: string
  source: Source
}

export type ApplicationInput = Omit<Application, 'id' | 'dateLastUpdated'>

export const CONTACT_STATUSES = [
  'Reached Out',
  'Responded',
  'No Response',
  'Called Me',
  'Interviewing Me',
  'Referred Me',
  'Cold',
] as const

export type ContactStatus = (typeof CONTACT_STATUSES)[number]

export interface Contact {
  id: string
  name: string
  title: string
  company: string
  linkedinUrl: string
  email: string
  phone: string
  applicationId: string | null
  status: ContactStatus
  dateContacted: string
  notes: string
  dateLastUpdated: string
}

export type ContactInput = Omit<Contact, 'id' | 'dateLastUpdated'>
