import { coordsToSquare, getValidMoves } from "@/moves"
import type { Color, GameState, Piece } from "@/state"

// Piece values in centipawns (1 pawn = 100)
const PIECE_VALUES: Record<string, number> = {
	p: 100,
	n: 320,
	b: 330,
	r: 500,
	q: 900,
	k: 20000
}

// Functions to generate piece-square tables for any board size
// Values are in centipawns and from white's perspective
const generatePawnTable = (size: number): number[][] => {
	const table: number[][] = Array(size)
		.fill(0)
		.map(() => Array(size).fill(0))

	for (let rank = 0; rank < size; rank++) {
		for (let file = 0; file < size; file++) {
			const relativeRank = rank / (size - 1)
			const relativeFile = file / (size - 1)
			const center = size / 2 - 0.5
			const distanceFromCenter = Math.abs(file - center) / (size / 2)

			let value = 20 - Math.floor(40 * distanceFromCenter)

			if (relativeRank < 0.25) {
				value += 50
			} else if (relativeRank < 0.5) {
				value += 30
			} else if (relativeRank < 0.75) {
				value += 20
			} else {
				value += 5
			}

			if (relativeFile > 0.25 && relativeFile < 0.75) {
				value += 10
			}

			table[rank][file] = value
		}
	}
	return table
}

const generateKnightTable = (size: number): number[][] => {
	const table: number[][] = Array(size)
		.fill(0)
		.map(() => Array(size).fill(0))

	for (let rank = 0; rank < size; rank++) {
		for (let file = 0; file < size; file++) {
			const center = size / 2 - 0.5
			const distanceFromCenter =
				Math.sqrt((rank - center) ** 2 + (file - center) ** 2) /
				((Math.sqrt(2) * size) / 2)

			table[rank][file] = Math.floor(20 - 70 * distanceFromCenter)
		}
	}
	return table
}

const generateBishopTable = (size: number): number[][] => {
	const table: number[][] = Array(size)
		.fill(0)
		.map(() => Array(size).fill(0))

	for (let rank = 0; rank < size; rank++) {
		for (let file = 0; file < size; file++) {
			const center = size / 2 - 0.5
			const distanceFromCenter =
				Math.sqrt((rank - center) ** 2 + (file - center) ** 2) /
				((Math.sqrt(2) * size) / 2)

			table[rank][file] = Math.floor(10 - 30 * distanceFromCenter)
		}
	}
	return table
}

const generateRookTable = (size: number): number[][] => {
	const table: number[][] = Array(size)
		.fill(0)
		.map(() => Array(size).fill(0))

	for (let rank = 0; rank < size; rank++) {
		for (let file = 0; file < size; file++) {
			if (rank === 1) {
				table[rank][file] = 20
			} else if (file === size / 2 - 1 || file === size / 2) {
				table[rank][file] = 10
			}
		}
	}
	return table
}

const generateQueenTable = (size: number): number[][] => {
	const table: number[][] = Array(size)
		.fill(0)
		.map(() => Array(size).fill(0))

	for (let rank = 0; rank < size; rank++) {
		for (let file = 0; file < size; file++) {
			const center = size / 2 - 0.5
			const distanceFromCenter =
				Math.sqrt((rank - center) ** 2 + (file - center) ** 2) /
				((Math.sqrt(2) * size) / 2)

			table[rank][file] = Math.floor(5 - 25 * distanceFromCenter)
		}
	}
	return table
}

const generateKingMiddleGameTable = (size: number): number[][] => {
	const table: number[][] = Array(size)
		.fill(0)
		.map(() => Array(size).fill(0))

	for (let rank = 0; rank < size; rank++) {
		for (let file = 0; file < size; file++) {
			const relativeRank = rank / (size - 1)
			const center = size / 2 - 0.5
			const distanceFromCenter = Math.abs(file - center) / (size / 2)

			if (relativeRank > 0.8) {
				table[rank][file] = -20 + Math.floor(40 * (1 - distanceFromCenter))
			} else {
				table[rank][file] = -50 + Math.floor(20 * distanceFromCenter)
			}
		}
	}
	return table
}

const generateKingEndGameTable = (size: number): number[][] => {
	const table: number[][] = Array(size)
		.fill(0)
		.map(() => Array(size).fill(0))

	for (let rank = 0; rank < size; rank++) {
		for (let file = 0; file < size; file++) {
			const center = size / 2 - 0.5
			const distanceFromCenter =
				Math.sqrt((rank - center) ** 2 + (file - center) ** 2) /
				((Math.sqrt(2) * size) / 2)

			table[rank][file] = Math.floor(40 - 90 * distanceFromCenter)
		}
	}
	return table
}

// Cache for generated tables
const tableCache = new Map<string, number[][]>()

// Get the appropriate piece square table for the current board size
const getPieceSquareTable = (
	piece: string,
	boardSize: number,
	endgame = false
): number[][] => {
	const cacheKey = `${piece}_${boardSize}_${endgame}`
	const cachedTable = tableCache.get(cacheKey)
	if (cachedTable) {
		return cachedTable
	}

	let table: number[][]
	switch (piece) {
		case "p":
			table = generatePawnTable(boardSize)
			break
		case "n":
			table = generateKnightTable(boardSize)
			break
		case "b":
			table = generateBishopTable(boardSize)
			break
		case "r":
			table = generateRookTable(boardSize)
			break
		case "q":
			table = generateQueenTable(boardSize)
			break
		case "k":
			table = endgame
				? generateKingEndGameTable(boardSize)
				: generateKingMiddleGameTable(boardSize)
			break
		default:
			table = Array(boardSize)
				.fill(0)
				.map(() => Array(boardSize).fill(0))
	}

	tableCache.set(cacheKey, table)
	return table
}

// Helper function to determine if we're in endgame
const isEndgame = (state: GameState): boolean => {
	let pieceValue = 0
	for (let rank = 0; rank < state.boardSize; rank++) {
		for (let file = 0; file < state.boardSize; file++) {
			const piece = state.board[rank][file]
			if (!piece || piece[1] === "k") continue
			pieceValue += PIECE_VALUES[piece[1]]
		}
	}
	return pieceValue <= 1500 // Roughly queen + rook
}

// Get positional score for a piece
const getPositionalScore = (
	piece: Piece,
	rank: number,
	file: number,
	state: GameState
): number => {
	const pieceType = piece[1]
	const color = piece[0]
	const endgame = isEndgame(state)
	const table = getPieceSquareTable(pieceType, state.boardSize, endgame)

	// For black pieces, flip both rank and file indices
	const rankIndex = color === "w" ? rank : state.boardSize - 1 - rank
	const fileIndex = color === "w" ? file : state.boardSize - 1 - file
	return table[rankIndex][fileIndex]
}

// Evaluate mobility (number of legal moves)
const evaluateMobility = (state: GameState, color: Color): number => {
	let mobility = 0
	for (let rank = 0; rank < state.boardSize; rank++) {
		for (let file = 0; file < state.boardSize; file++) {
			const piece = state.board[rank][file]
			if (!piece || piece[0] !== color) continue

			const square = coordsToSquare(rank, file, state.boardSize)
			const moves = getValidMoves(
				{
					...state,
					board: state.board.map((row) => [...row]),
					activeColor: color
				},
				square
			)
			mobility += moves.length
		}
	}
	return mobility
}

// Main evaluation function
export const evaluate = (state: GameState): number => {
	let score = 0
	let materialScore = 0
	let positionalScore = 0

	// Material and positional evaluation
	for (let rank = 0; rank < state.boardSize; rank++) {
		for (let file = 0; file < state.boardSize; file++) {
			const piece = state.board[rank][file]
			if (!piece) continue

			const pieceValue = PIECE_VALUES[piece[1]]
			const positionalValue = getPositionalScore(piece, rank, file, state)

			if (piece[0] === "w") {
				materialScore += pieceValue
				positionalScore += positionalValue
			} else {
				materialScore -= pieceValue
				positionalScore -= positionalValue
			}
		}
	}

	score = materialScore + positionalScore

	// Mobility evaluation (weighted less than material)
	// Normalize mobility by board size to maintain consistent scale
	const mobilityWeight = 0.1 / state.boardSize
	const whiteMobility = evaluateMobility(state, "w")
	const blackMobility = evaluateMobility(state, "b")
	score += mobilityWeight * (whiteMobility - blackMobility)

	// Return the score from white's perspective
	return score
}
