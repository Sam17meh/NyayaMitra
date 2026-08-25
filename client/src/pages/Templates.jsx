import { useState } from 'react'
import api from '../api.js'
import usePageTitle from '../hooks/usePageTitle.js'

export default function Templates() {
  usePageTitle('NyayaMitra - Templates')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    incidentDescription: '',
    requestedAction: ''
  })

  const handleChange = (e) => {
    let { name, value } = e.target
    if (name === 'phone') {
      value = value.replace(/\D/g, '')
    }
    setFormData({ ...formData, [name]: value })
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/api/documents/generate', {
        templateType: 'complaint',
        formData
      }, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'complaint.pdf')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (err) {
      console.error(err)
      setError('Failed to generate document. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 pb-32 sm:p-8 sm:pb-32">
      <div className="mx-auto flex max-w-3xl flex-col rounded-lg bg-white p-4 shadow sm:p-6">
        <header className="mb-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Document Generation</h1>
            <p className="text-sm text-slate-600">Generate a formal complaint letter</p>
          </div>
        </header>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Complainant Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded border border-gray-300 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input required type="tel" name="phone" value={formData.phone} maxLength="10" onChange={handleChange} className="mt-1 block w-full rounded border border-gray-300 p-2" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input required type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full rounded border border-gray-300 p-2" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input required type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full rounded border border-gray-300 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category of Complaint</label>
              <select required name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded border border-gray-300 p-2">
                <option value="">Select a category</option>
                <option value="Consumer Fraud">Consumer Fraud</option>
                <option value="Property Dispute">Property Dispute</option>
                <option value="Employment Issue">Employment Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description of Incident</label>
            <textarea required rows={4} name="incidentDescription" value={formData.incidentDescription} onChange={handleChange} className="mt-1 block w-full rounded border border-gray-300 p-2"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Requested Action</label>
            <textarea required rows={2} name="requestedAction" value={formData.requestedAction} onChange={handleChange} className="mt-1 block w-full rounded border border-gray-300 p-2"></textarea>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded bg-indigo-600 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Generating PDF...' : 'Generate PDF'}
          </button>
        </form>
      </div>
    </main>
  )
}
