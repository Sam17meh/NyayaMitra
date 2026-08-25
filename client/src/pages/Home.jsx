import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import usePageTitle from '../hooks/usePageTitle.js'

const actions = [
  {
    title: 'Ask a legal question',
    description: 'Get clear, practical guidance about Indian law.',
    icon: '?',
    to: '/chat',
  },
  {
    title: 'Generate a document',
    description: 'Create a formal complaint letter in a few steps.',
    icon: '+',
    to: '/templates',
  },
  {
    title: 'Emergency contacts',
    description: 'Keep the people you trust close when it matters.',
    icon: '!',
    to: '/emergency-contacts',
  },
]

export default function Home() {
  usePageTitle('NyayaMitra - Home')
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 pb-32 sm:px-8 sm:py-16 sm:pb-32">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-indigo-600">NyayaMitra</p>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Welcome back</h1>
          <p className="mt-2 text-slate-600">{user?.email}</p>
        </header>

        <section className="grid gap-4 md:grid-cols-3" aria-label="NyayaMitra services">
          {actions.map((action) => (
            <Link
              key={action.title}
              to={action.to}
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-100 text-xl font-bold text-indigo-700">
                {action.icon}
              </span>
              <h2 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700">{action.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}