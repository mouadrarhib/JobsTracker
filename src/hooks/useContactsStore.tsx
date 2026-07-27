import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Contact, ContactInput } from '../types'
import { contactsService } from '../services/contactsService'

interface ContactsStoreValue {
  contacts: Contact[]
  loading: boolean
  error: string | null
  addContact: (input: ContactInput) => Promise<Contact>
  updateContact: (id: string, patch: Partial<ContactInput>) => Promise<Contact>
  deleteContact: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const ContactsContext = createContext<ContactsStoreValue | null>(null)

function errorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return 'Something went wrong loading your contacts.'
}

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const list = await contactsService.getContacts()
      setContacts(list)
      setError(null)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addContact = useCallback(async (input: ContactInput) => {
    const created = await contactsService.addContact(input)
    setContacts((prev) => [created, ...prev])
    return created
  }, [])

  const updateContact = useCallback(async (id: string, patch: Partial<ContactInput>) => {
    const updated = await contactsService.updateContact(id, patch)
    setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)))
    return updated
  }, [])

  const deleteContact = useCallback(async (id: string) => {
    await contactsService.deleteContact(id)
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const value = useMemo(
    () => ({ contacts, loading, error, addContact, updateContact, deleteContact, refresh }),
    [contacts, loading, error, addContact, updateContact, deleteContact, refresh],
  )

  return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>
}

export function useContactsStore() {
  const ctx = useContext(ContactsContext)
  if (!ctx) throw new Error('useContactsStore must be used within a ContactsProvider')
  return ctx
}
