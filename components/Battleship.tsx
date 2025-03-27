/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import React, { useState, useEffect, useRef, type ReactElement, useCallback } from "react"
import type { Ship, Cell, Board, GameState } from "@/types/battleship"
import Image from "next/image"

interface BattleshipProps {
    username: string
    onGameOver: (playerWon: boolean) => void
    onScoreUpdate: (points: number) => void
    onGameResult: (result: IGameResult) => void
    score: number
}

interface IGameResult {
    ships_sunk: number
    total_shots: number
    hit_percentage: number
    winner: boolean
}

export default function Battleship({ onGameOver, onScoreUpdate, onGameResult, score }: BattleshipProps): ReactElement {
    const [playerBoard, setPlayerBoard] = useState<Board>([])
    const [computerBoard, setComputerBoard] = useState<Board>([])
    const [playerShips, setPlayerShips] = useState<Ship[]>([])
    const [computerShips, setComputerShips] = useState<Ship[]>([])
    const [gameState, setGameState] = useState<GameState>("setup")
    const [selectedShip, setSelectedShip] = useState<Ship | null>(null)
    const [shipOrientation, setShipOrientation] = useState<"horizontal" | "vertical">("horizontal")
    const [message, setMessage] = useState<string>("Place your ships on the board")
    const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true)
    const [animatingCell, setAnimatingCell] = useState<{ row: number; col: number; type: "hit" | "miss" } | null>(null)
    const [remainingShips, setRemainingShips] = useState({
        battleship: 1,
        cruiser: 2,
        destroyer: 3,
        submarine: 4,
    })

    const [gameResult, setGameResult] = useState<IGameResult | null>({
        ships_sunk: 0,
        total_shots: 0,
        hit_percentage: 0,
        winner: false,
    });


    const [gameStartTime, setGameStartTime] = useState<number>(0)
    const [elapsedTime, setElapsedTime] = useState<number>(0)
    const [huntStrategy, setHuntStrategy] = useState<{
        mode: "random" | "hunt" | "target";
        lastHit: { row: number; col: number } | null;
        potentialTargets: Array<{ row: number; col: number }>;
    }>({
        mode: "random",
        lastHit: null,
        potentialTargets: [],
    });


    const explosionSound = useRef<HTMLAudioElement | null>(null)
    const splashSound = useRef<HTMLAudioElement | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const isMountedRef = useRef(true)

    const createEmptyBoard = useCallback((): Board => {
        const board: Board = []
        for (let i = 0; i < 10; i++) {
            const row: Cell[] = []
            for (let j = 0; j < 10; j++) {
                row.push({
                    row: i,
                    col: j,
                    status: "empty",
                    ship: null,
                })
            }
            board.push(row)
        }
        return board
    }, [])

    const canPlaceShip = useCallback(
        (board: Board, row: number, col: number, size: number, orientation: "horizontal" | "vertical"): boolean => {
            if (orientation === "horizontal" && col + size > 10) return false
            if (orientation === "vertical" && row + size > 10) return false

            for (let i = -1; i <= size; i++) {
                for (let j = -1; j <= 1; j++) {
                    const checkRow = orientation === "horizontal" ? row + j : row + i
                    const checkCol = orientation === "horizontal" ? col + i : col + j

                    if (checkRow >= 0 && checkRow < 10 && checkCol >= 0 && checkCol < 10) {
                        if (board[checkRow][checkCol].status === "ship") {
                            return false
                        }
                    }
                }
            }

            return true
        },
        [],
    )

    const placeComputerShips = useCallback(
        (board: Board) => {
            const ships: Ship[] = []
            const newBoard = JSON.parse(JSON.stringify(board)) as Board

            const shipsToPlace = [
                { type: "battleship", size: 4, count: 1 },
                { type: "cruiser", size: 3, count: 2 },
                { type: "destroyer", size: 2, count: 3 },
                { type: "submarine", size: 1, count: 4 },
            ]

            for (const shipConfig of shipsToPlace) {
                for (let i = 0; i < shipConfig.count; i++) {
                    let placed = false
                    while (!placed) {
                        const orientation = Math.random() < 0.5 ? "horizontal" : "vertical"
                        const row = Math.floor(Math.random() * 10)
                        const col = Math.floor(Math.random() * 10)

                        if (canPlaceShip(newBoard, row, col, shipConfig.size, orientation)) {
                            const ship: Ship = {
                                id: `computer-${shipConfig.type}-${i}`,
                                type: shipConfig.type,
                                size: shipConfig.size,
                                positions: [],
                                hits: 0,
                                sunk: false,
                            }

                            if (orientation === "horizontal") {
                                for (let j = 0; j < shipConfig.size; j++) {
                                    newBoard[row][col + j].status = "ship"
                                    newBoard[row][col + j].ship = ship.id
                                    ship.positions.push({ row, col: col + j })
                                }
                            } else {
                                for (let j = 0; j < shipConfig.size; j++) {
                                    newBoard[row + j][col].status = "ship"
                                    newBoard[row + j][col].ship = ship.id
                                    ship.positions.push({ row: row + j, col })
                                }
                            }

                            ships.push(ship)
                            placed = true
                        }
                    }
                }
            }

            return { board: newBoard, ships }
        },
        [canPlaceShip],
    )

    const initializeGame = useCallback(() => {
        if (!isMountedRef.current) return

        const emptyPlayerBoard = createEmptyBoard()
        const emptyComputerBoard = createEmptyBoard()

        const { board: computerBoardWithShips, ships: placedComputerShips } = placeComputerShips(emptyComputerBoard)

        setPlayerBoard(emptyPlayerBoard)
        setComputerBoard(computerBoardWithShips)
        setPlayerShips([])
        setComputerShips(placedComputerShips)
        setGameState("setup")
        setMessage("Place your ships on the board")
        setIsPlayerTurn(true)
        setRemainingShips({
            battleship: 1,
            cruiser: 2,
            destroyer: 3,
            submarine: 4,
        })
        setGameStartTime(0)
        setElapsedTime(0)
        setHuntStrategy({
            mode: "random",
            lastHit: null,
            potentialTargets: [],
        })
    }, [createEmptyBoard, placeComputerShips])

    useEffect(() => {
        isMountedRef.current = true
        initializeGame()

        explosionSound.current = new Audio("/sounds/explosion.mp3")
        splashSound.current = new Audio("/sounds/splash.mp3")

        return () => {
            isMountedRef.current = false
            if (explosionSound.current) explosionSound.current.pause()
            if (splashSound.current) splashSound.current.pause()
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [initializeGame])

    useEffect(() => {
        if (gameState === "playing") {
            if (gameStartTime === 0) setGameStartTime(Date.now())

            timerRef.current = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - gameStartTime) / 1000))
            }, 1000)
        } else if (timerRef.current) {
            clearInterval(timerRef.current)
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [gameState, gameStartTime])

    const findComputerTarget = useCallback((board: Board) => {
        const { mode, lastHit, potentialTargets } = huntStrategy;

        if (mode === "target" && lastHit && potentialTargets.length > 0) {
            // Continue targeting adjacent ship cells
            const target = potentialTargets[0];
            const newPotentialTargets: { row: number; col: number }[] = potentialTargets.slice(1);

            return {
                target,
                strategy: {
                    mode: newPotentialTargets.length > 0 ? "target" : "random",
                    lastHit,
                    potentialTargets: newPotentialTargets,
                },
            };
        }

        // Generate list of untargeted cells
        const untargetedCells: { row: number; col: number }[] = [];
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (board[i][j].status !== "hit" && board[i][j].status !== "miss") {
                    untargetedCells.push({ row: i, col: j });
                }
            }
        }

        if (untargetedCells.length === 0) {
            return {
                target: { row: Math.floor(Math.random() * 10), col: Math.floor(Math.random() * 10) },
                strategy: huntStrategy,
            };
        }

        // Prefer checkerboard pattern for better search efficiency
        const preferredCells = untargetedCells.filter((cell) => (cell.row + cell.col) % 2 === 0);
        const target =
            preferredCells.length > 0
                ? preferredCells[Math.floor(Math.random() * preferredCells.length)]
                : untargetedCells[Math.floor(Math.random() * untargetedCells.length)];

        return {
            target,
            strategy: {
                mode: "random",
                lastHit: null,
                potentialTargets: [],
            },
        };
    }, [huntStrategy]);

    const computerMove = useCallback(() => {
        if (gameState !== "playing") {
            setIsPlayerTurn(true);
            return;
        }

        const newPlayerBoard = JSON.parse(JSON.stringify(playerBoard)) as Board;
        const newPlayerShips = JSON.parse(JSON.stringify(playerShips)) as Ship[];

        const { target, strategy } = findComputerTarget(newPlayerBoard);
        const { row: targetRow, col: targetCol } = target;

        setHuntStrategy({
            ...strategy,
            mode: strategy.mode as "random" | "hunt" | "target",
        });

        if (newPlayerBoard[targetRow][targetCol].status === "ship") {
            // Hit a ship
            newPlayerBoard[targetRow][targetCol].status = "hit";
            setMessage(`Ferris hit your ship at position ${String.fromCharCode(65 + targetCol)}${targetRow + 1}!`);
            setAnimatingCell({ row: targetRow, col: targetCol, type: "hit" });

            if (explosionSound.current) {
                explosionSound.current.currentTime = 0;
                explosionSound.current.play();
            }

            const shipId = newPlayerBoard[targetRow][targetCol].ship;
            const shipIndex = newPlayerShips.findIndex((ship) => ship.id === shipId);

            if (shipIndex !== -1) {
                newPlayerShips[shipIndex].hits += 1;
                const hitPoints = 20;
                onScoreUpdate(-hitPoints);
                if (newPlayerShips[shipIndex].hits === newPlayerShips[shipIndex].size) {
                    // Ship is sunk
                    newPlayerShips[shipIndex].sunk = true;
                    setMessage(`Ferris sank your ${getShipName(newPlayerShips[shipIndex].type)}!`);
                }

                const newPotentialTargets = [
                    { row: targetRow - 1, col: targetCol },
                    { row: targetRow + 1, col: targetCol },
                    { row: targetRow, col: targetCol - 1 },
                    { row: targetRow, col: targetCol + 1 },
                ].filter(
                    (cell): cell is { row: number; col: number } =>
                        cell.row >= 0 &&
                        cell.row < 10 &&
                        cell.col >= 0 &&
                        cell.col < 10 &&
                        newPlayerBoard[cell.row][cell.col].status !== "hit" &&
                        newPlayerBoard[cell.row][cell.col].status !== "miss"
                );

                setHuntStrategy({
                    mode: "target",
                    lastHit: { row: targetRow, col: targetCol },
                    potentialTargets: newPotentialTargets,
                });

                setPlayerBoard(newPlayerBoard);
                setPlayerShips(newPlayerShips);

                if (newPlayerShips.every((ship) => ship.sunk)) {
                    setGameState("gameOver");
                    setMessage("Game over! Ferris won.");
                    onGameResult(gameResult as IGameResult);
                    onGameOver(false);

                    setGameResult((prev) => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            winner: false,
                        };
                    });

                    return;
                }
            }

            setTimeout(() => {
                setAnimatingCell(null);
                setIsPlayerTurn(true);
            }, 800);
        } else {
            newPlayerBoard[targetRow][targetCol].status = "miss";
            setMessage(`Ferris missed at position ${String.fromCharCode(65 + targetCol)}${targetRow + 1}. Your turn!`);
            setAnimatingCell({ row: targetRow, col: targetCol, type: "miss" });

            if (splashSound.current && explosionSound.current) {
                explosionSound.current.currentTime = 0;
                explosionSound.current.play();
            }

            setPlayerBoard(newPlayerBoard);

            setTimeout(() => {
                setAnimatingCell(null);
                setIsPlayerTurn(true);
            }, 800);
        }
    }, [gameState, playerBoard, playerShips, findComputerTarget, explosionSound, splashSound, onGameOver]);

    const handleShipPlacement = useCallback(
        (row: number, col: number) => {
            console.log(
                "Attempting to place ship at:",
                row,
                col,
                "Selected ship:",
                selectedShip,
                "Orientation:",
                shipOrientation,
            )

            if (!selectedShip) {
                setMessage("First select a ship to place from the buttons above")
                return
            }

            if (!canPlaceShip(playerBoard, row, col, selectedShip.size, shipOrientation)) {
                if (shipOrientation === "horizontal" && col + selectedShip.size > 10) {
                    setMessage(`Ship is too wide! Cannot place ${getShipName(selectedShip.type)} horizontally here.`)
                } else if (shipOrientation === "vertical" && row + selectedShip.size > 10) {
                    setMessage(`Ship is too tall! Cannot place ${getShipName(selectedShip.type)} vertically here.`)
                } else {
                    setMessage("Cannot place ship here. It might overlap with another ship or be too close.")
                }
                return
            }
            const newBoard = JSON.parse(JSON.stringify(playerBoard)) as Board
            const newShip: Ship = {
                id: `player-${selectedShip.type}-${Date.now()}`,
                type: selectedShip.type,
                size: selectedShip.size,
                positions: [],
                hits: 0,
                sunk: false,
            }

            if (shipOrientation === "horizontal") {
                for (let j = 0; j < selectedShip.size; j++) {
                    newBoard[row][col + j].status = "ship"
                    newBoard[row][col + j].ship = newShip.id
                    newShip.positions.push({ row, col: col + j })
                }
            } else {
                for (let j = 0; j < selectedShip.size; j++) {
                    newBoard[row + j][col].status = "ship"
                    newBoard[row + j][col].ship = newShip.id
                    newShip.positions.push({ row: row + j, col })
                }
            }

            setPlayerBoard(newBoard)
            setPlayerShips([...playerShips, newShip])

            const newRemainingShips = { ...remainingShips }
            newRemainingShips[selectedShip.type as keyof typeof remainingShips] -= 1
            setRemainingShips(newRemainingShips)
            setSelectedShip(null)

            const totalRemainingShips = Object.values(newRemainingShips).reduce((sum, count) => sum + count, 0)
            if (totalRemainingShips === 0) {
                setGameState("playing")
                setGameStartTime(Date.now())
                setMessage("Your turn! Click on a cell in the opponent's grid to fire.")
            }
        },
        [playerBoard, playerShips, remainingShips, selectedShip, shipOrientation, canPlaceShip],
    )

    const handlePlayerShot = useCallback(
        (row: number, col: number) => {
            if (computerBoard[row][col].status === "hit" || computerBoard[row][col].status === "miss") {
                setMessage("You already fired at this position. Choose another.")
                return
            }

            const newComputerBoard = JSON.parse(JSON.stringify(computerBoard)) as Board
            const newComputerShips = JSON.parse(JSON.stringify(computerShips)) as Ship[]

            if (newComputerBoard[row][col].status === "ship") {
                newComputerBoard[row][col].status = "hit"
                setMessage("Hit! Wait for Ferris's turn.")
                setAnimatingCell({ row, col, type: "hit" })

                if (explosionSound.current) {
                    explosionSound.current.currentTime = 0
                    explosionSound.current.play()
                }

                const shipId = newComputerBoard[row][col].ship
                const shipIndex = newComputerShips.findIndex((ship) => ship.id === shipId)

                if (shipIndex !== -1) {
                    newComputerShips[shipIndex].hits += 1

                    if (newComputerShips[shipIndex].hits === newComputerShips[shipIndex].size) {
                        newComputerShips[shipIndex].sunk = true
                        setMessage(`You sank Ferris's ${getShipName(newComputerShips[shipIndex].type)}!`)

                        const pointsForShip = newComputerShips[shipIndex].size * 20
                        onScoreUpdate(pointsForShip)

                        setGameResult(prev => {
                            if (!prev) return null
                            return {
                                ...prev,
                                ships_sunk: prev.ships_sunk + 1,
                                total_shots: prev.total_shots + 1,
                                hit_percentage: ((prev.ships_sunk + 1) / (prev.total_shots + 1)) * 100,
                            }
                        })
                    } else {
                        onScoreUpdate(10)
                    }
                }

                setComputerBoard(newComputerBoard)
                setComputerShips(newComputerShips)

                setGameResult((prev) => {
                    if (!prev) return null
                    return {
                        ...prev,
                        total_shots: prev.total_shots + 1,
                        hit_percentage: (prev.ships_sunk / (prev.total_shots + 1)) * 100,
                    }
                })

                if (newComputerShips.every((ship) => ship.sunk)) {
                    setGameState("gameOver")
                    onGameResult(gameResult as IGameResult);


                    const timeBonus = calculateTimeBonus(elapsedTime)
                    onScoreUpdate(timeBonus)

                    setGameResult((prev) => {
                        if (!prev) return null
                        return {
                            ...prev,
                            winner: true,
                        }
                    })

                    setMessage(`Congratulations! You won with a time bonus of ${timeBonus} points!`)
                    onGameOver(true)
                    return
                }

                setIsPlayerTurn(false)
                setTimeout(() => {
                    setAnimatingCell(null)
                    computerMove()
                }, 800)
            } else {
                newComputerBoard[row][col].status = "miss"
                setMessage("Miss! Wait for Ferris's turn.")
                setAnimatingCell({ row, col, type: "miss" })

                if (splashSound.current && explosionSound.current) {
                    explosionSound.current.currentTime = 0
                    explosionSound.current.play()
                }

                setComputerBoard(newComputerBoard)

                setGameResult(prev => {
                    if (!prev) return null
                    return {
                        ...prev,
                        total_shots: prev.total_shots + 1,
                        hit_percentage: (prev.ships_sunk / (prev.total_shots + 1)) * 100,
                    }
                })

                setIsPlayerTurn(false)
                setTimeout(() => {
                    setAnimatingCell(null)
                    computerMove()
                }, 800)
            }
        },
        [computerBoard, computerShips, elapsedTime, onScoreUpdate, onGameOver, explosionSound, splashSound, computerMove],
    )

    const handleCellClick = useCallback(
        (row: number, col: number, isPlayerBoard: boolean) => {
            if (gameState === "setup" && isPlayerBoard) {
                handleShipPlacement(row, col)
            } else if (gameState === "playing" && !isPlayerBoard && isPlayerTurn) {
                handlePlayerShot(row, col)
            }
        },
        [gameState, isPlayerTurn, handleShipPlacement, handlePlayerShot],
    )
    const calculateTimeBonus = (seconds: number): number => {
        if (seconds < 60) return 500
        if (seconds < 120) return 300
        if (seconds < 180) return 200
        if (seconds < 240) return 100
        return 50
    }

    const getShipName = (type: string): string => {
        switch (type) {
            case "battleship":
                return "Battleship"
            case "cruiser":
                return "Cruiser"
            case "destroyer":
                return "Destroyer"
            case "submarine":
                return "Submarine"
            default:
                return "ship"
        }
    }

    const selectShipForPlacement = (type: string, size: number) => {
        if (remainingShips[type as keyof typeof remainingShips] > 0) {
            setSelectedShip({
                id: "",
                type,
                size,
                positions: [],
                hits: 0,
                sunk: false,
            })
            setMessage(`Select a position to place your ${getShipName(type)}`)
        }
    }

    const toggleOrientation = () => {
        setShipOrientation((prev) => (prev === "horizontal" ? "vertical" : "horizontal"))
    }

    const getCellClass = (cell: Cell, isPlayerBoard: boolean, isAnimating = false) => {
        const baseClass = "border border-gray-300 flex items-center justify-center transition-colors relative"

        if (isAnimating) {
            return `${baseClass} ${cell.status === "hit" ? "bg-red-500" : "bg-blue-300"}`
        }

        if (isPlayerBoard) {
            switch (cell.status) {
                case "empty":
                    return `${baseClass} bg-pink-100 hover:bg-pink-200`
                case "ship":
                    return `${baseClass} bg-pink-500`
                case "hit":
                    return `${baseClass} bg-red-500 hit-cell`
                case "miss":
                    return `${baseClass} bg-blue-300`
                default:
                    return baseClass
            }
        } else {
            switch (cell.status) {
                case "empty":
                case "ship":
                    return `${baseClass} bg-pink-100 ${isPlayerTurn ? "hover:bg-pink-200 cursor-pointer" : ""}`
                case "hit":
                    return `${baseClass} bg-red-500 hit-cell`
                case "miss":
                    return `${baseClass} bg-blue-300`
                default:
                    return baseClass
            }
        }
    }

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <div className="flex flex-col items-center">
            <div className="mb-2 text-center relative">
                <div className="relative flex justify-center items-center w-full h-12 sm:h-32 mb-4">
                    <Image src="/mascot.gif" alt="Crab Mascot" width={100} height={100} className="object-contain mx-auto" />
                </div>

                <h2 className="text-xl font-bold text-pink-600 mb-2 mt-2">Battleship</h2>
                <p className="text-gray-700 mb-2">{message}</p>
                <div className="flex justify-center items-center gap-4">
                    <p className="text-lg font-semibold">Score: {score}</p>
                    {gameState === "playing" && <p className="text-lg font-semibold">Time: {formatTime(elapsedTime)}</p>}
                </div>
            </div>

            {gameState === "setup" && (
                <div className="mb-4 w-full px-2">
                    <div className="flex flex-wrap gap-2 mb-4 justify-center">
                        {remainingShips.battleship > 0 && (
                            <button
                                type="button"
                                onClick={() => selectShipForPlacement("battleship", 4)}
                                className={`px-3 py-1 rounded ${selectedShip?.type === "battleship" ? "bg-pink-600 text-white" : "bg-pink-200 hover:bg-pink-300"}`}
                            >
                                Battleship (4) x{remainingShips.battleship}
                            </button>
                        )}
                        {remainingShips.cruiser > 0 && (
                            <button
                                type="button"
                                onClick={() => selectShipForPlacement("cruiser", 3)}
                                className={`px-3 py-1 rounded ${selectedShip?.type === "cruiser" ? "bg-pink-600 text-white" : "bg-pink-200 hover:bg-pink-300"}`}
                            >
                                Cruiser (3) x{remainingShips.cruiser}
                            </button>
                        )}
                        {remainingShips.destroyer > 0 && (
                            <button
                                type="button"
                                onClick={() => selectShipForPlacement("destroyer", 2)}
                                className={`px-3 py-1 rounded ${selectedShip?.type === "destroyer" ? "bg-pink-600 text-white" : "bg-pink-200 hover:bg-pink-300"}`}
                            >
                                Destroyer (2) x{remainingShips.destroyer}
                            </button>
                        )}
                        {remainingShips.submarine > 0 && (
                            <button
                                type="button"
                                onClick={() => selectShipForPlacement("submarine", 1)}
                                className={`px-3 py-1 rounded ${selectedShip?.type === "submarine" ? "bg-pink-600 text-white" : "bg-pink-200 hover:bg-pink-300"}`}
                            >
                                Submarine (1) x{remainingShips.submarine}
                            </button>
                        )}
                    </div>

                    {selectedShip && (
                        <button
                            type="button"
                            onClick={toggleOrientation}
                            className="px-3 py-1 mb-4 rounded bg-pink-400 hover:bg-pink-500 text-white mx-auto block"
                        >
                            {shipOrientation === "horizontal" ? "Horizontal" : "Vertical"}
                        </button>
                    )}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 mb-4 w-full overflow-x-auto px-2">
                <div className="w-full lg:w-auto">
                    <h3 className="text-center mb-2 font-semibold">Your Grid</h3>
                    <div className="grid grid-cols-11 mx-auto" style={{ maxWidth: "fit-content" }}>
                        <div className="w-8 h-8 sm:w-10 sm:h-10"></div>
                        {Array.from({ length: 10 }, (_, i) => (
                            <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-semibold">
                                {String.fromCharCode(65 + i)}
                            </div>
                        ))}

                        {playerBoard.map((row, rowIndex) => (
                            <React.Fragment key={`row-${rowIndex}`}>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-semibold">
                                    {rowIndex + 1}
                                </div>
                                {row.map((cell, colIndex) => {
                                    const isAnimating =
                                        animatingCell !== null &&
                                        animatingCell.row === rowIndex &&
                                        animatingCell.col === colIndex &&
                                        !isPlayerTurn
                                    return (
                                        <button
                                            key={`${rowIndex}-${colIndex}`}
                                            className={getCellClass(cell, true, isAnimating)}
                                            onClick={() => handleCellClick(rowIndex, colIndex, true)}
                                            disabled={gameState !== "setup"}
                                            style={{ width: "2.5rem", height: "2.5rem" }}
                                        >
                                            {cell.status === "hit" && (
                                                <div className={`${isAnimating ? "animate-ping" : ""}`}>
                                                    <div className="flames">🔥</div>
                                                </div>
                                            )}
                                            {cell.status === "miss" && <div className={`${isAnimating ? "animate-ping" : ""}`}>•</div>}
                                            {isAnimating && cell.status === "hit" && (
                                                <div className="absolute inset-0 bg-red-500 animate-pulse rounded-full"></div>
                                            )}
                                            {isAnimating && cell.status === "miss" && (
                                                <div className="absolute inset-0 bg-blue-300 animate-pulse rounded-full"></div>
                                            )}
                                        </button>
                                    )
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="w-full lg:w-auto mt-8 mb-12 lg:mb-0 lg:mt-0">
                    <h3 className="text-center mb-2 font-semibold">Ferris&apos;s Grid</h3>
                    <div className="grid grid-cols-11 mx-auto" style={{ maxWidth: "fit-content" }}>
                        {/* Column headers */}
                        <div className="w-8 h-8 sm:w-10 sm:h-10"></div>
                        {Array.from({ length: 10 }, (_, i) => (
                            <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-semibold">
                                {String.fromCharCode(65 + i)}
                            </div>
                        ))}

                        {computerBoard.map((row, rowIndex) => (
                            <React.Fragment key={`row-${rowIndex}`}>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-semibold">
                                    {rowIndex + 1}
                                </div>
                                {row.map((cell, colIndex) => {
                                    const isAnimating =
                                        animatingCell !== null &&
                                        animatingCell.row === rowIndex &&
                                        animatingCell.col === colIndex &&
                                        isPlayerTurn
                                    return (
                                        <button
                                            key={`${rowIndex}-${colIndex}`}
                                            className={getCellClass(cell, false, isAnimating)}
                                            onClick={() => handleCellClick(rowIndex, colIndex, false)}
                                            disabled={gameState !== "playing" || !isPlayerTurn}
                                            style={{ width: "2.5rem", height: "2.5rem" }}
                                        >
                                            {cell.status === "hit" && (
                                                <div className={`${isAnimating ? "animate-ping" : ""}`}>
                                                    <div className="flames">🔥</div>
                                                </div>
                                            )}
                                            {cell.status === "miss" && <div className={`${isAnimating ? "animate-ping" : ""}`}>•</div>}
                                            {isAnimating && cell.status === "hit" && (
                                                <div className="absolute inset-0 bg-red-500 animate-pulse rounded-full"></div>
                                            )}
                                            {isAnimating && cell.status === "miss" && (
                                                <div className="absolute inset-0 bg-blue-300 animate-pulse rounded-full"></div>
                                            )}
                                        </button>
                                    )
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {gameState === "playing" && (
                <div className="mt-4 p-3 bg-pink-100 rounded-md border border-pink-300 w-full max-w-md mx-auto">
                    <p className="text-pink-800 text-center">
                        {isPlayerTurn
                            ? "It's your turn! Click on Ferris's grid to fire."
                            : "Ferris is thinking... Please wait for your turn."}
                    </p>
                </div>
            )}
        </div>
    )
}

