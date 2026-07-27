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
