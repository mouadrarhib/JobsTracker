import { v4 as uuidv4 } from 'uuid'
import type { Application } from '../types'
import type { DataService } from './dataService'
import { SEED_APPLICATIONS } from './seedData'

const STORAGE_KEY = 'masar_applications_v1'

function readStore(): Application[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_APPLICATIONS))
    return SEED_APPLICATIONS
  }
  try {
    return JSON.parse(raw) as Application[]
  } catch {
    return []
  }
}

function writeStore(applications: Application[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
}

const nowIso = () => new Date().toISOString().slice(0, 10)

export const localStorageDataService: DataService = {
  async getApplications() {
    return readStore()
  },

  async getApplication(id) {
    return readStore().find((app) => app.id === id)
  },

  async addApplication(input) {
    const applications = readStore()
    const newApplication: Application = {
      ...input,
      id: uuidv4(),
      dateLastUpdated: nowIso(),
    }
    writeStore([newApplication, ...applications])
    return newApplication
  },

  async updateApplication(id, patch) {
    const applications = readStore()
    const index = applications.findIndex((app) => app.id === id)
    if (index === -1) {
      throw new Error(`Application ${id} not found`)
    }
    const updated: Application = {
      ...applications[index],
      ...patch,
      dateLastUpdated: nowIso(),
    }
    applications[index] = updated
    writeStore(applications)
    return updated
  },

  async deleteApplication(id) {
    const applications = readStore().filter((app) => app.id !== id)
    writeStore(applications)
  },

  async exportAll() {
    return readStore()
  },

  async importAll(applications) {
    writeStore(applications)
  },
}
