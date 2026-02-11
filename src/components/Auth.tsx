'use client'
import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    // Validation
    const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email)
    const isValidPassword = (password: string) => password.length >= 6

    const handleSignUp = async () => {
        if (!isValidEmail(email)) return alert('Please enter a valid email address.')
        if (!isValidPassword(password)) return alert('Password must be at least 6 characters long.')

        setLoading(true)
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        if (error) alert(error.message)
        setLoading(false)
    }

    const handleLogin = async () => {
        if (!isValidEmail(email)) return alert('Please enter a valid email address.')
        if (!isValidPassword(password)) return alert('Password must be at least 6 characters long.')

        setLoading(true)
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) alert(error.message)
        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-4 p-4 border rounded max-w-sm mx-auto bg-white shadow-lg">
            <h2 className="text-xl font-bold text-center">Authentication</h2>
            <div className="flex flex-col gap-2">
                <input
                    className="border p-2 rounded"
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    disabled={loading}
                />
                <input
                    className="border p-2 rounded"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 chars)"
                    disabled={loading}
                />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleSignUp}
                    disabled={loading}
                    className="bg-blue-500 text-white p-2 rounded flex-1 hover:bg-blue-600 transition disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Sign Up'}
                </button>
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="bg-green-500 text-white p-2 rounded flex-1 hover:bg-green-600 transition disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Log In'}
                </button>
            </div>
        </div>
    )
}
