"use client"

import { useState, useEffect, ReactElement, useRef } from "react"

import { Dialog } from "@/components/ui/dialog"
import Login from "@/components/Login"
import GameInfo from "@/components/GameInfo"
import Console from "@/components/Console"
import Battleship from "@/components/Battleship"
import SuccinctSocials from "@/components/SuccinctSocials"
import { verifyBattleship } from "@/lib/service"
import { ProofResponse } from "@/types/battleship"

interface IGameResult {
  ships_sunk: number
  total_shots: number
  hit_percentage: number
  winner: boolean
}

export default function Home(): ReactElement {
  const [username, setUsername] = useState<string>("")
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [showInfo, setShowInfo] = useState<boolean>(false)
  const [showConsole, setShowConsole] = useState<boolean>(false)
  const [score, setScore] = useState<number>(0)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [winner, setWinner] = useState<string>("")
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const [result, setResult] = useState<ProofResponse | null>(null)


  const [isProofing, setIsProofing] = useState<boolean>(false)
  const [isStarted, setIsStarted] = useState<boolean>(false)

  const [gameResult, setGameResult] = useState<IGameResult | null>({
    ships_sunk: 0,
    total_shots: 0,
    hit_percentage: 0,
    winner: false,
  });


  useEffect(() => {
    const storedUsername = sessionStorage.getItem("battleshipUsername")
    if (storedUsername) {
      setUsername(storedUsername)
    }

    const audio = new Audio("/sounds/background.mp3")
    audio.loop = true
    audio.volume = 0.3
    audioElementRef.current = audio

    audio.play().catch(() => console.log("Audio autoplay prevented by browser"))
    setIsMusicPlaying(true)

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current.currentTime = 0
      }
    }
  }, [])

  const toggleMusic = () => {
    if (audioElementRef) {
      if (isMusicPlaying) {
        audioElementRef.current?.pause()
      } else {
        audioElementRef.current?.play()
      }
      setIsMusicPlaying(!isMusicPlaying)
    }
  }

  const handleLogin = (name: string) => {
    sessionStorage.setItem("battleshipUsername", name)
    setUsername(name)
  }

  const startGame = () => {
    setGameStarted(true)
    setShowInfo(false)
    setGameOver(false)
    setScore(0)

    if (audioElementRef && !isMusicPlaying) {
      audioElementRef.current?.play().catch(() => console.log("Audio autoplay prevented by browser"))
      setIsMusicPlaying(true)
    }
  }

  const showGameInfo = () => {
    setShowInfo(true)
  }

  const handleGameResult = (result: IGameResult) => {
    setGameResult(result)
  }

  const handleGameOver = (playerWon: boolean) => {
    setGameOver(true)
    setWinner(playerWon ? username : "Ferris")
  }

  const handleReplay = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setShowConsole(false)
  }

  const handleSetResult = (result: ProofResponse) => {
    setResult(result)
    setIsProofing(false)
    setIsStarted(false)
  }

  const handleProve = async (): Promise<void> => {
    setShowConsole(true)
    setIsProofing(true)
    setIsStarted(true)
    try {
      const data: IGameResult = {
        ships_sunk: gameResult?.ships_sunk || 0,
        total_shots: gameResult?.total_shots || 0,
        hit_percentage: gameResult?.hit_percentage || 0,
        winner: winner === username,
      }

      const response = await verifyBattleship(username, data)

      if (response.success) {
        handleSetResult(response)
        console.log("Proof generated successfully:", response)
      } else {
        console.error("Error generating proof:", response)
        alert("Error generating proof. Please try again.")
      }
    } catch (error) {
      console.error("Error generating proof:", error)
      alert("Error generating proof. Please try again.")
    } finally {
      setIsProofing(false)
      setIsStarted(false)
    }
  }

  const updateScore = (points: number) => {
    setScore((prevScore) => prevScore + points)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-pink-400 to-pink-600 p-2 sm:p-4">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-pink-500 text-white p-3 flex flex-col sm:flex-row justify-between items-center gap-2">
          <h1 className="text-xl font-bold">Battleship</h1>
          <div className="flex items-center gap-4">
            {username && <div>Player: {username}</div>}
            <button
              onClick={toggleMusic}
              className="px-3 py-1 rounded bg-pink-600 hover:bg-pink-700 text-white text-sm"
            >
              {isMusicPlaying ? "Mute Music" : "Play Music"}
            </button>
          </div>
        </div>

        <div className="p-2 sm:p-4">
          {!username ? (
            <Login onLogin={handleLogin} />
          ) : !gameStarted ? (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={showGameInfo}
                className="w-full max-w-md bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded"
              >
                Information
              </button>
              <button
                onClick={startGame}
                className="w-full max-w-md bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded"
              >
                Start Game
              </button>

              <Dialog open={showInfo} onOpenChange={setShowInfo}>
                <GameInfo onClose={() => setShowInfo(false)} />
              </Dialog>
            </div>
          ) : gameOver ? (
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
              <p className="text-xl mb-4">Winner: {winner}</p>
              <p className="text-lg mb-6">Your score: {score}</p>
              <div className="flex gap-4">
                <button
                  onClick={handleReplay}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded"
                >
                  Play Again
                </button>
                {result?.success !== true && (
                  <button
                    disabled={isProofing || isStarted}
                    onClick={handleProve}
                    className={
                      `bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded ${isProofing || isStarted ? "opacity-50 cursor-not-allowed" : ""
                      }`
                    }
                  >
                    Prove
                  </button>
                )}
              </div>
              {showConsole && <Console
                isStarted={isStarted}
                isProofing={isProofing}
                result={result}
                isError={result?.success === false}
                errorMessage={result?.success === false ? "Error generating proof" : ""}
              />}
            </div>
          ) : (
            <Battleship username={username} onGameOver={handleGameOver} onScoreUpdate={updateScore} score={score} onGameResult={handleGameResult} />
          )}
        </div>
      </div>
      <SuccinctSocials />
    </main>
  )
}

