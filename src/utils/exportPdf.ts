import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Application, Contact } from '../types'
import type { ExportScope } from './exportUtils'
import { computeApplicationSummary, computeContactSummary, computeFunnel, computeResumeStats } from './analytics'

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

function applicationLabel(applications: Application[], id: string | null) {
  if (!id) return ''
  const app = applications.find((a) => a.id === id)
  return app ? `${app.companyName} — ${app.role}` : ''
}

function finalY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
}

export function buildExportPdf(scope: ExportScope, applications: Application[], contacts: Contact[]): jsPDF {
  const doc = new jsPDF({ orientation: 'landscape' })
  let cursorY = 14

  doc.setFontSize(16)
  doc.text('Masār — Job Search Export', 14, cursorY)
  doc.setFontSize(10)
  doc.setTextColor(120)
  cursorY += 6
  doc.text(`Generated ${todayStamp()}`, 14, cursorY)
  doc.setTextColor(0)
  cursorY += 8

  if (scope.analytics) {
    const summary = computeApplicationSummary(applications)
    const contactSummary = computeContactSummary(contacts)

    doc.setFontSize(13)
    doc.text('Analytics Summary', 14, cursorY)
    cursorY += 6

    autoTable(doc, {
      startY: cursorY,
      head: [['Metric', 'Value']],
      body: [
        ['Total applications', String(summary.total)],
        ['Active applications', String(summary.active)],
        ['Interviews this month', String(summary.interviewsThisMonth)],
        ['Average score', String(summary.averageScore)],
        ['Response rate', `${summary.responseRate}%`],
        ['Contacts logged', String(contactSummary.total)],
        ['Contact response rate', `${contactSummary.responseRate}%`],
        ['Currently interviewing me', String(contactSummary.interviewingMe)],
      ],
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    })
    cursorY = finalY(doc) + 6

    const funnel = computeFunnel(applications)
    doc.setFontSize(13)
    doc.text('Funnel', 14, cursorY)
    cursorY += 4
    autoTable(doc, {
      startY: cursorY,
      head: [['Stage', 'Count', 'Percent']],
      body: funnel.map((f) => [f.label, String(f.count), `${f.pct}%`]),
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    })
    cursorY = finalY(doc) + 6

    const resumeStats = computeResumeStats(applications)
    if (resumeStats.rows.length > 0) {
      doc.setFontSize(13)
      doc.text('Resume Performance', 14, cursorY)
      cursorY += 4
      autoTable(doc, {
        startY: cursorY,
        head: [['Resume Version', 'Applied', 'Response Rate', 'Interview Rate', 'Offers']],
        body: resumeStats.rows.map((r) => [
          r.version, String(r.applied), `${r.responseRate}%`, `${r.interviewRate}%`, String(r.offers),
        ]),
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      })
      cursorY = finalY(doc) + 6
    }
  }

  if (scope.applications) {
    if (cursorY > 180) {
      doc.addPage()
      cursorY = 14
    }
    doc.setFontSize(13)
    doc.text('Applications', 14, cursorY)
    cursorY += 4
    autoTable(doc, {
      startY: cursorY,
      head: [['Company', 'Role', 'Status', 'Score', 'Location', 'Source', 'Applied', 'Last Updated']],
      body: applications.map((a) => [
        a.companyName, a.role, a.status, String(a.score), a.location, a.source, a.dateApplied, a.dateLastUpdated,
      ]),
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })
    cursorY = finalY(doc) + 8
  }

  if (scope.contacts) {
    if (cursorY > 180) {
      doc.addPage()
      cursorY = 14
    }
    doc.setFontSize(13)
    doc.text('Contacts', 14, cursorY)
    cursorY += 4
    autoTable(doc, {
      startY: cursorY,
      head: [['Name', 'Title', 'Company', 'Status', 'Linked Application', 'Contacted']],
      body: contacts.map((c) => [
        c.name, c.title, c.company, c.status, applicationLabel(applications, c.applicationId), c.dateContacted,
      ]),
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })
  }

  return doc
}
