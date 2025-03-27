"use client"

import { useState, useEffect } from "react"

export default function Console() {
  const [logs, setLogs] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(true)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    const processes = [
      "Initializing verification...",
      "Loading game data...",
      "Checking data integrity...",
      "Analyzing player moves...",
      "Verifying computer algorithm...",
      "Validating results...",
      "Computing final score...",
      "Generating report...",
    ]

    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex < processes.length) {
        setLogs((prev) => [...prev, processes[currentIndex]])
        currentIndex++
      } else {
        clearInterval(interval)
        setIsRunning(false)

        // Randomly decide if the verification was successful
        const isSuccess = Math.random() > 0.3
        setResult(isSuccess ? "Proved" : "Error")
      }
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-6 w-full">
      <div className="bg-gray-900 text-green-400 p-2 sm:p-4 rounded-md font-mono text-xs sm:text-sm h-48 sm:h-64 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="mb-1">
            <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
          </div>
        ))}

        {!isRunning && result && (
          <div className={`mt-4 font-bold ${result === "Proved" ? "text-green-500" : "text-red-500"}`}>
            <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> Result: {result}
          </div>
        )}

        {isRunning && (
          <div className="animate-pulse">
            <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> Processing...
          </div>
        )}
      </div>
    </div>
  )
}

