# 📤 Export Module

Lets a user pick exactly what they want (applications, contacts, the analytics summary — any combination) and get it back as JSON, CSV, or a formatted PDF report. Reachable from the "Export data..." button in the [Sidebar](shared-components.md#sidebar).

**Files:**
- `src/components/ExportModal.tsx` — the scope/format picker UI
- `src/utils/exportUtils.ts` — JSON building, CSV building, file download, and the PDF lazy-load boundary
- `src/utils/exportPdf.ts` — the actual PDF document builder (jsPDF + jspdf-autotable)

---

## `ExportModal`

A modal with two independent choices:

1. **Scope** — three checkboxes: Applications, Contacts, Analytics summary. Any combination, including all three (`selectAll()`) or none (export button disabled via `!anySelected`).
2. **Format** — radio-style cards: JSON, CSV, or PDF, each with a one-line explanation of what that format is best for.

`handleExport` branches on `format` and, for each selected scope item, calls the matching builder:

```ts
if (format === 'json') {
  const data = buildExportJson(scope, applications, contacts)
  downloadFile(`masar-export-${date}.json`, JSON.stringify(data, null, 2), 'application/json')
}
if (format === 'csv') {
  if (scope.applications) downloadFile(`masar-applications-${date}.csv`, applicationsToCsv(applications), 'text/csv')
  if (scope.contacts) downloadFile(`masar-contacts-${date}.csv`, contactsToCsv(contacts, applications), 'text/csv')
  if (scope.analytics) downloadFile(`masar-analytics-${date}.csv`, analyticsToCsv(applications, contacts), 'text/csv')
}
if (format === 'pdf') {
  const doc = await buildExportPdf(scope, applications, contacts)
  doc.save(`masar-export-${date}.pdf`)
}
```

Note that **JSON always produces one file** (a single object with whichever of `applications` / `contacts` / `analytics` keys were selected), while **CSV produces one file per selected scope** — three checkboxes checked means three separate `.csv` downloads, since CSV can't naturally represent three differently-shaped tables in one file the way JSON or a multi-section PDF can.

## `exportUtils.ts`

### `downloadFile(filename, content, mimeType)`
The one shared download mechanism: wraps content in a `Blob`, creates an object URL, synthesizes an `<a download>` click, then revokes the URL. Every export format funnels through this.

### CSV builders
`applicationsToCsv`, `contactsToCsv`, `analyticsToCsv` — all built on a small `toCsvTable(header, rows)` helper with proper `csvEscape` (quotes any value containing a comma, quote, or newline, and doubles internal quotes). `analyticsToCsv` is the most involved: it stitches together multiple labeled sections (summary metrics, status breakdown, funnel, resume performance, contact status breakdown) into one CSV with blank-line separators between sections, since CSV has no native concept of multiple tables in one file.

### JSON builder
`buildExportJson(scope, applications, contacts)` — for the `analytics` scope, it doesn't export raw applications/contacts again; it calls the same six functions from [`analytics.ts`](analytics.md) and nests their output under an `analytics` key, so the JSON export's numbers are the exact same computation as what's on screen.

### The PDF lazy-load boundary
```ts
// jsPDF pulls in ~380KB (gzipped) of transitive deps (html2canvas, dompurify) that
// only matter for the PDF path — dynamically imported so everyone else's bundle
// stays small.
export async function buildExportPdf(scope, applications, contacts) {
  const { buildExportPdf: build } = await import('./exportPdf')
  return build(scope, applications, contacts)
}
```
This is the reason `exportPdf.ts` is a separate file from `exportUtils.ts` at all: `jsPDF` and `jspdf-autotable` are only pulled into the bundle the moment a user actually chooses PDF export, via a dynamic `import()`. Every user who never touches PDF export never downloads that code.

## `exportPdf.ts`

Builds a landscape `jsPDF` document section by section, tracking a `cursorY` position manually and calling `doc.addPage()` whenever the next section would overflow the current page (`cursorY > 180`):

1. Header: "Masār — Job Search Export" + generation date.
2. If `scope.analytics`: an analytics summary table, a funnel table, and (if any exist) a resume-performance table — each via `jspdf-autotable`, tracking the next `cursorY` from `doc.lastAutoTable.finalY`.
3. If `scope.applications`: a full applications table (company, role, status, score, location, source, dates).
4. If `scope.contacts`: a full contacts table (name, title, company, status, linked application via the same `applicationLabel` helper pattern used elsewhere, date contacted).

Font sizes shrink for the raw data tables (`fontSize: 8`) versus the summary tables (`fontSize: 9`) to fit more columns per page in landscape orientation.

## Related modules

- [Analytics](analytics.md) — every metric exported here is computed by `src/utils/analytics.ts`
- [Applications](applications.md) / [Contacts](contacts.md) — the raw data being exported
- [Shared Components](shared-components.md#sidebar) — where the Export modal is triggered from
