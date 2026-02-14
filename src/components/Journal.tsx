'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

// Define the shape of our data
interface Entry {
    id: string
    content: string
    created_at: string
    user_id: string
    image_url?: string
}

export default function Journal() {
    const [entries, setEntries] = useState<Entry[]>([])
    const [newEntry, setNewEntry] = useState('')
    const [file, setFile] = useState<File | null>(null)
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
        if (!newEntry.trim() && !file) return

        // We must manually attach the user_id, OR use a database trigger. 
        // For Phase 1, let's get the user from the session locally.
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return alert('Please login first')

        let imageUrl = null

        if (file) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('memories')
                .upload(filePath, file)

            if (uploadError) {
                console.error('Error uploading file:', uploadError)
                return alert('Failed to upload file')
            }

            const { data: { publicUrl } } = supabase.storage
                .from('memories')
                .getPublicUrl(filePath)

            imageUrl = publicUrl
        }

        const { error } = await supabase
            .from('entries')
            .insert({
                content: newEntry,
                user_id: user.id,
                image_url: imageUrl
            })

        if (error) console.log('Error adding:', error)
        else {
            setNewEntry('')
            setFile(null)
            fetchEntries() // Refresh the list
        }
    }

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">My Journal</h2>
            <div className="mb-8 p-4 border rounded bg-gray-50">
                <textarea
                    className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] mb-2"
                    value={newEntry}
                    onChange={(e) => setNewEntry(e.target.value)}
                    placeholder="What's on your mind?"
                />

                <div className="flex justify-between items-center">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button
                        onClick={addEntry}
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition disabled:opacity-50"
                        disabled={!newEntry.trim() && !file}
                    >
                        Save Entry
                    </button>
                </div>
                {file && (
                    <p className="text-xs text-green-600 mt-2">
                        Selected: {file.name}
                    </p>
                )}
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
                            {entry.image_url && (
                                <div className="mt-4">
                                    <img
                                        src={entry.image_url}
                                        alt="Journal attachment"
                                        className="max-w-full h-auto rounded max-h-[400px]"
                                        loading="lazy"
                                    />
                                </div>
                            )}
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
