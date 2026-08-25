import { useEffect, useMemo, useState } from 'react'
import api from '../api.js'
import usePageTitle from '../hooks/usePageTitle.js'

const RELATION_OPTIONS = ['family', 'friend', 'colleague', 'other']

const emptyForm = {
  name: '',
  phone: '',
  relation: 'family',
}

export default function EmergencyContacts() {
  usePageTitle('NyayaMitra - Emergency Contacts')

  const [contacts, setContacts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isAtCapacity = contacts.length >= 5

  const isPhoneValid = useMemo(() => {
    const digits = form.phone.replace(/\D/g, '')
    return digits.length >= 8 && digits.length <= 15
  }, [form.phone])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/api/emergency-contacts')
      setContacts(data.contacts || [])
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to load emergency contacts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const cleanedPhone = form.phone.replace(/\D/g, '')
    const cleanedRelation = form.relation.trim().toLowerCase()

    if (!form.name.trim() || !cleanedPhone || !cleanedRelation) {
      setError('All fields are required.')
      setSuccess('')
      return
    }

    if (!/^\d{8,15}$/.test(cleanedPhone)) {
      setError('Phone number must contain only digits and be between 8 and 15 characters long.')
      setSuccess('')
      return
    }

    if (contacts.length >= 5) {
      setError('Maximum 5 emergency contacts reached')
      setSuccess('')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const { data } = await api.post('/api/emergency-contacts', {
        name: form.name.trim(),
        phone: cleanedPhone,
        relation: cleanedRelation,
      })

      setContacts((current) => [...current, data.contact])
      setForm(emptyForm)
      setSuccess('Emergency contact added successfully.')
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to add emergency contact.')
      setSuccess('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (contactId) => {
    try {
      setDeletingId(contactId)
      setError('')
      setSuccess('')
      await api.delete(`/api/emergency-contacts/${contactId}`)
      setContacts((current) => current.filter((contact) => contact.id !== contactId))
      setSuccess('Emergency contact removed.')
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to delete emergency contact.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 pb-32 sm:p-8 sm:pb-32">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-5 shadow-md sm:p-8">
        <div className="mb-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">Emergency</p>
            <h1 className="text-3xl font-bold text-slate-900">Emergency Contacts</h1>
          </div>
        </div>

        {error && <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {success && <p className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Your contacts</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {contacts.length}/5
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading contacts...</p>
          ) : contacts.length === 0 ? (
            <p className="rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              No emergency contacts added yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {contacts.map((contact) => (
                <li key={contact.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{contact.name}</p>
                    <p className="text-sm text-slate-600">{contact.phone}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{contact.relation}</p>
                  </div>
                  <button
                    type="button"
                    className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                    onClick={() => handleDelete(contact.id)}
                    disabled={deletingId === contact.id}
                  >
                    {deletingId === contact.id ? 'Deleting...' : 'Delete'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-900">Add contact</h2>

          {isAtCapacity ? (
            <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Maximum 5 emergency contacts reached
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  placeholder="9876543210"
                />
                {form.phone && !isPhoneValid && (
                  <p className="mt-1 text-xs text-red-600">Digits only, 8–15 characters recommended.</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="relation">
                  Relation
                </label>
                <select
                  id="relation"
                  name="relation"
                  value={form.relation}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                >
                  {RELATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting || !form.name.trim() || !isPhoneValid}
                className="rounded bg-indigo-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? 'Adding...' : 'Add contact'}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}
