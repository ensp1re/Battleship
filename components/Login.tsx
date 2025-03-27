"use client"

import type React from "react"

import { useState } from "react"

interface LoginProps {
    onLogin: (username: string) => void
}

export default function Login({ onLogin }: LoginProps) {
    const [username, setUsername] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!username.trim()) {
            setError("Please enter a username")
            return
        }

        onLogin(username)
    }

    return (
        <div className="flex flex-col items-center p-2 sm:p-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-pink-600">Login to Play</h2>

            <form onSubmit={handleSubmit} className="w-full max-w-md">
                <div className="mb-4">
                    <label htmlFor="username" className="block text-gray-700 mb-2">
                        Username:
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Enter your username"
                    />
                    {error && <p className="text-red-500 mt-1">{error}</p>}
                </div>

                <button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded">
                    Login
                </button>
            </form>
        </div>
    )
}

