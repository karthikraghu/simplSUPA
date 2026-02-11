'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

// Define the shape of our data
interface Entry {
    id: string
    content: string
    created_at: string
    user_id: string
}

export default function Journal() {
    const [entries, setEntries] = useState<Entry[]>([])
    const [newEntry, setNewEntry] = useState('')
    const [loading, setLoading] = useState(true)

    // READ: Fetch entries on load
    useEffect(() => {
        fetchEntries()
    }, [])

    const fetchEntries = async () => {
        setLoading(true)
        // This looks simple, but RLS is secretly filtering the data for us!
        const { data, error } = await supabase
            .from('entries')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) console.log('Error fetching:', error)
        else setEntries(data as Entry[])
        setLoading(false)
    }

    // CREATE: Add a new entry
    const addEntry = async () => {
        if (!newEntry.trim()) return

        // We must manually attach the user_id, OR use a database trigger. 
        // For Phase 1, let's get the user from the session locally.
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return alert('Please login first')

        const { error } = await supabase
            .from('entries')
            .insert({ content: newEntry, user_id: user.id })

        if (error) console.log('Error adding:', error)
        else {
            setNewEntry('')
            fetchEntries() // Refresh the list
        }
    }

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">My Journal</h2>
            <div className="mb-8">
                <textarea
                    className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                    value={newEntry}
                    onChange={(e) => setNewEntry(e.target.value)}
                    placeholder="What's on your mind?"
                />
                <button
                    onClick={addEntry}
                    className="bg-black text-white px-4 py-2 mt-2 rounded hover:bg-gray-800 transition disabled:opacity-50"
                    disabled={!newEntry.trim()}
                >
                    Save Entry
                </button>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <p>Loading entries...</p>
                ) : entries.length === 0 ? (
                    <p className="text-gray-500">No entries yet. Write something!</p>
                ) : (
                    entries.map((entry) => (
                        <div key={entry.id} className="p-4 border rounded shadow-sm bg-white">
                            <p className="whitespace-pre-wrap">{entry.content}</p>
                            <small className="text-gray-500 block mt-2 text-right">
                                {new Date(entry.created_at).toLocaleString()}
                            </small>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
