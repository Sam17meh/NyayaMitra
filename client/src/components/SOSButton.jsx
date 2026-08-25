import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api.js'

export default function SOSButton() {
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [message, setMessage] = useState('')

  const handleSOS = () => {
    if (!navigator.geolocation) {
      setStatus('error')
      setMessage('Geolocation is not supported by your browser')
      return
    }

    setStatus('loading')
    setMessage('Acquiring location...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          setMessage('Notifying contacts...')
          const { data } = await api.post('/api/sos', { latitude, longitude })
          if (data.smsSent && data.contactsNotified > 0) {
            setStatus('success')
            setMessage(`Emergency contacts notified! Nearest Station: ${data.nearestPoliceStation}`)
          } else {
            setStatus('warning')
            setMessage(`Location logged, but SMS notification failed — please call your contacts directly. Nearest Station: ${data.nearestPoliceStation}`)
          }
          
          // Reset after a while
          setTimeout(() => {
            setStatus('idle')
            setMessage('')
          }, 15000)
        } catch (error) {
          setStatus('error')
          setMessage(error.response?.data?.error || 'Failed to trigger SOS')
        }
      },
      (geoError) => {
        setStatus('error')
        setMessage('Could not get your location. Please ensure location access is granted.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleSOS}
        disabled={status === 'loading'}
        className={`flex h-24 w-24 items-center justify-center rounded-full text-white font-bold text-2xl shadow-xl transition-transform active:scale-95 ${
          status === 'loading'
            ? 'bg-red-400 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700 hover:shadow-2xl'
        }`}
        aria-label="SOS Emergency Button"
      >
        SOS
      </button>

      <Link
        to="/emergency-contacts"
        className="mt-3 inline-flex items-center rounded-full bg-slate-900/80 px-3 py-1.5 text-[11px] font-medium text-white shadow-md backdrop-blur-sm transition hover:bg-slate-800"
      >
        Manage contacts
      </Link>

      {status !== 'idle' && (
        <div
          className={`mt-4 rounded p-3 text-center text-sm font-medium ${
            status === 'error' ? 'bg-red-100 text-red-800' :
            status === 'success' ? 'bg-green-100 text-green-800' :
            'bg-yellow-100 text-yellow-800'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}
