import { useState } from 'react'
import api from '../api.js'
import usePageTitle from '../hooks/usePageTitle.js'

export default function Chat() {
  usePageTitle('NyayaMitra - Chat')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const question = message.trim()
    if (!question || loading) return

    setLoading(true)
    setError('')
    setMessage('')
    try {
      const { data } = await api.post('/api/chat', { message: question })
      setMessages((current) => [...current, { question, ...data }])
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to send your question.')
      setMessage(question)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 pb-32 sm:p-8 sm:pb-32">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col rounded-lg bg-white p-4 shadow sm:p-6">
        <header className="border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ask a question about Indian law</h1>
            <p className="text-sm text-slate-600">Get clear, practical legal guidance</p>
          </div>
        </header>

        <section className="flex-1 space-y-4 overflow-y-auto py-5" aria-live="polite">
          {!messages.length && <p className="text-center text-slate-500">Your answers will appear here.</p>}
          {messages.map((item, index) => (
            <article className="space-y-3" key={`${item.question}-${index}`}>
              <div className="ml-auto max-w-[90%] rounded-lg bg-indigo-50 p-3 text-slate-800">
                <p className="text-xs font-semibold uppercase text-indigo-700">You</p>
                <p>{item.question}</p>
              </div>
              <div className="max-w-[90%] rounded-lg bg-slate-100 p-3 text-slate-800">
                <div className="mb-2 flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase text-slate-600">NyayaMitra</p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-indigo-700">{item.category}</span>
                </div>
                <p className="whitespace-pre-wrap">{item.answer}</p>
              </div>
            </article>
          ))}
        </section>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <form className="flex gap-2 border-t pt-4" onSubmit={handleSubmit}>
          <input className="min-w-0 flex-1 rounded border p-3" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe your legal question" disabled={loading} />
          <button className="rounded bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50" type="submit" disabled={loading || !message.trim()}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </main>
  )
}