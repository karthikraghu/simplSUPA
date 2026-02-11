'use client'
import { useEffect, useState } from 'react'
import Auth from '../components/Auth'
import Journal from '../components/Journal'
import { supabase } from '../utils/supabase'
import { Session } from '@supabase/supabase-js'

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">MemoryBox</h1>
        <p className="text-lg text-gray-600">Securely store your thoughts.</p>
      </div>

      {!session ? (
        <Auth />
      ) : (
        <div>
          <div className="flex justify-end max-w-2xl mx-auto mb-4">
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-red-500 hover:underline"
            >
              Sign Out
            </button>
          </div>
          <Journal />
        </div>
      )}
    </main>
  )
}
