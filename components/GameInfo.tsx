"use client"

import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface GameInfoProps {
    onClose: () => void
}

export default function GameInfo({ onClose }: GameInfoProps) {
    return (
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-pink-600">How to Play Battleship</DialogTitle>
                <DialogDescription>Learn the rules and strategies to win the game</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
                <div>
                    <h3 className="text-lg font-semibold text-pink-600 mb-2">Game Rules:</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Place your ships on the 10x10 grid.</li>
                        <li>Take turns with Ferris (the computer) to fire shots at each other&apos;s ships.</li>
                        <li>You must wait for Ferris to take its turn before you can fire again.</li>
                        <li>The first player to sink all of the opponent&apos;s ships wins.</li>
                        <li>You earn 10 points for each hit and bonus points for sinking ships.</li>
                        <li>Win faster to earn a time bonus! The quicker you win, the more points you get.</li>
                    </ol>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-pink-600 mb-2">Ships:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>1 Battleship (4 cells)</li>
                        <li>2 Cruisers (3 cells each)</li>
                        <li>3 Destroyers (2 cells each)</li>
                        <li>4 Submarines (1 cell each)</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-pink-600 mb-2">Tips:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Place your ships strategically to make them harder to find.</li>
                        <li>When you hit a ship, try firing at adjacent cells to sink it.</li>
                        <li>Keep track of your hits and misses to avoid wasting shots.</li>
                        <li>Be careful! Ferris is smart and will target areas around successful hits.</li>
                    </ul>
                </div>
            </div>

            <DialogFooter>
                <Button onClick={onClose} className="bg-pink-500 hover:bg-pink-600">
                    Got it!
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

