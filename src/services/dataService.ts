import type { Application, ApplicationInput } from '../types'

export interface DataService {
  getApplications(): Promise<Application[]>
  getApplication(id: string): Promise<Application | undefined>
  addApplication(input: ApplicationInput): Promise<Application>
  updateApplication(id: string, patch: Partial<ApplicationInput>): Promise<Application>
  deleteApplication(id: string): Promise<void>
  exportAll(): Promise<Application[]>
  importAll(applications: Application[]): Promise<void>
}

import { supabaseDataService } from './supabaseDataService'

export const dataService: DataService = supabaseDataService
