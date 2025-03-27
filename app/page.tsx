"use client"

import { useState, useEffect, ReactElement, useRef } from "react"

import { Dialog } from "@/components/ui/dialog"
import Login from "@/components/Login"
import GameInfo from "@/components/GameInfo"
import Console from "@/components/Console"
import Battleship from "@/components/Battleship"

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

    // Ensure music is playing when game starts
    if (audioElementRef && !isMusicPlaying) {
      audioElementRef.current?.play().catch(() => console.log("Audio autoplay prevented by browser"))
      setIsMusicPlaying(true)
    }
  }

  const showGameInfo = () => {
    setShowInfo(true)
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

  const handleProve = () => {
    setShowConsole(true)
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
                <button
                  onClick={handleProve}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded"
                >
                  Prove
                </button>
              </div>
              {showConsole && <Console />}
            </div>
          ) : (
            <Battleship username={username} onGameOver={handleGameOver} onScoreUpdate={updateScore} score={score} />
          )}
        </div>
      </div>
    </main>
  )
}

