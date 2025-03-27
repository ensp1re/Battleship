"use client"

import { ProofResponse } from "@/types/battleship"
import { useState, useEffect, ReactElement } from "react"

interface IConsoleProps {
  isStarted: boolean
  isProofing: boolean
  result: ProofResponse | null
  isError: boolean
  errorMessage: string
}


export default function Console({
  isStarted,
  isProofing,
  result,
  isError,
  errorMessage,
}: IConsoleProps): ReactElement | null {
  const [logs, setLogs] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isStarted || !isProofing) {
      setLogs([])
      setIsRunning(false)
      return
    }

    setIsRunning(true)
    const processes = [
      "Initializing verification...",
      "Loading game data...",
      "Checking data integrity...",
      "Validating results...",
      "Generating proof...",
    ]

    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex < processes.length) {
        setLogs((prev) => [...prev, processes[currentIndex]])
        currentIndex++
      } else {
        clearInterval(interval)
        setIsRunning(false)

      }
    }, 800)

    return () => clearInterval(interval)
  }, [isStarted, isProofing])

  return (
    <div className="mt-6 w-full">
      <div className="bg-gray-900 text-green-400 p-2 sm:p-4 rounded-md font-mono text-xs sm:text-sm h-48 sm:h-64 overflow-y-auto">
        {logs.map((log, index) => (
          <div
            key={index}
            className={`mb-1 ${log === "Generating proof..." && isRunning ? "animate-pulse" : ""
              }`}
          >
            <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
          </div>
        ))}

        {!isRunning && result && !isStarted && (
          <div className={`mt-4 font-bold ${result.success === true ? "text-green-500" : "text-red-500"}`}>
            <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> Result: {JSON.stringify(result)}
          </div>
        )}


        {isError && !isRunning && !isStarted && (
          <div className="mt-4 text-red-500 font-bold">
            <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> Error: {errorMessage}
          </div>
        )}
      </div>
    </div>
  )
}
