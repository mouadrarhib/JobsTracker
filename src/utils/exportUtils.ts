import type { Application, Contact } from '../types'
import {
  computeApplicationSummary,
  computeContactSummary,
  computeContactStatusBreakdown,
  computeFunnel,
  computeResumeStats,
  computeStatusBreakdown,
} from './analytics'

export interface ExportScope {
  applications: boolean
  contacts: boolean
  analytics: boolean
}

export type ExportFormat = 'json' | 'csv' | 'pdf'

export function downloadFile(filename: string, content: string | Blob, mimeType?: string) {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function csvEscape(value: unknown): string {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCsvTable(header: string[], rows: unknown[][]): string {
  const lines = [header.map(csvEscape).join(',')]
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(','))
  }
  return lines.join('\n')
}

function applicationLabel(applications: Application[], id: string | null) {
  if (!id) return ''
  const app = applications.find((a) => a.id === id)
  return app ? `${app.companyName} — ${app.role}` : ''
}

// ---------- CSV ----------

export function applicationsToCsv(applications: Application[]): string {
  const header = [
    'Company', 'Role', 'Location', 'Status', 'Score', 'Source', 'Date Applied', 'Last Updated',
    'Resume Version', 'Cover Letter Sent', 'Contact Person', 'Salary Range', 'Job URL', 'Notes', 'Job Description',
  ]
  const rows = applications.map((a) => [
    a.companyName, a.role, a.location, a.status, a.score, a.source, a.dateApplied, a.dateLastUpdated,
    a.resumeVersion, a.coverLetterSent ? 'Yes' : 'No', a.contactPerson, a.salaryRange, a.jobUrl, a.notes, a.jobDescription,
  ])
  return toCsvTable(header, rows)
}

export function contactsToCsv(contacts: Contact[], applications: Application[]): string {
  const header = [
    'Name', 'Title', 'Company', 'Status', 'Email', 'Phone', 'LinkedIn URL',
    'Linked Application', 'Date Contacted', 'Last Updated', 'Notes',
  ]
  const rows = contacts.map((c) => [
    c.name, c.title, c.company, c.status, c.email, c.phone, c.linkedinUrl,
    applicationLabel(applications, c.applicationId), c.dateContacted, c.dateLastUpdated, c.notes,
  ])
  return toCsvTable(header, rows)
}

export function analyticsToCsv(applications: Application[], contacts: Contact[]): string {
  const summary = computeApplicationSummary(applications)
  const contactSummary = computeContactSummary(contacts)
  const statusBreakdown = computeStatusBreakdown(applications)
  const funnel = computeFunnel(applications)
  const resumeStats = computeResumeStats(applications)
  const contactStatusBreakdown = computeContactStatusBreakdown(contacts)

  const sections: string[] = []

  sections.push(
    toCsvTable(
      ['Metric', 'Value'],
      [
        ['Total applications', summary.total],
        ['Active applications', summary.active],
        ['Interviews this month', summary.interviewsThisMonth],
        ['Average score', summary.averageScore],
        ['Response rate (%)', summary.responseRate],
        ['Contacts logged', contactSummary.total],
        ['Contact response rate (%)', contactSummary.responseRate],
        ['Currently interviewing me', contactSummary.interviewingMe],
      ],
    ),
  )

  sections.push('')
  sections.push('Status Breakdown')
  sections.push(toCsvTable(['Status', 'Count'], statusBreakdown.map((s) => [s.status, s.count])))

  sections.push('')
  sections.push('Funnel')
  sections.push(toCsvTable(['Stage', 'Count', 'Percent'], funnel.map((f) => [f.label, f.count, f.pct])))

  if (resumeStats.rows.length > 0) {
    sections.push('')
    sections.push('Resume Performance')
    sections.push(
      toCsvTable(
        ['Resume Version', 'Applied', 'Response Rate (%)', 'Interview Rate (%)', 'Offers'],
        resumeStats.rows.map((r) => [r.version, r.applied, r.responseRate, r.interviewRate, r.offers]),
      ),
    )
  }

  if (contactSummary.total > 0) {
    sections.push('')
    sections.push('Contact Status Breakdown')
    sections.push(toCsvTable(['Status', 'Count'], contactStatusBreakdown.map((s) => [s.status, s.count])))
  }

  return sections.join('\n')
}

// ---------- JSON ----------

export function buildExportJson(scope: ExportScope, applications: Application[], contacts: Contact[]) {
  const data: Record<string, unknown> = {}
  if (scope.applications) data.applications = applications
  if (scope.contacts) data.contacts = contacts
  if (scope.analytics) {
    data.analytics = {
      applicationSummary: computeApplicationSummary(applications),
      contactSummary: computeContactSummary(contacts),
      statusBreakdown: computeStatusBreakdown(applications),
      funnel: computeFunnel(applications),
      resumeStats: computeResumeStats(applications),
      contactStatusBreakdown: computeContactStatusBreakdown(contacts),
    }
  }
  return data
}

// ---------- PDF ----------
// jsPDF pulls in ~380KB (gzipped) of transitive deps (html2canvas, dompurify) that
// only matter for the PDF path — dynamically imported so everyone else's bundle
// stays small. See exportPdf.ts for the actual document-building logic.

export async function buildExportPdf(scope: ExportScope, applications: Application[], contacts: Contact[]) {
  const { buildExportPdf: build } = await import('./exportPdf')
  return build(scope, applications, contacts)
}
