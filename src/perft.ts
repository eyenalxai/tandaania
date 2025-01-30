import { ChessGame } from "@/game"
import {
	type Move,
	coordsToSquare,
	getValidMoves,
	isSquareUnderAttack,
	squareToCoords
} from "@/moves"
import { type GameState, type Square, toFen } from "@/state"

export type PerftResult = {
	nodes: number
	captures: number
	enPassant: number
	castles: number
	promotions: number
	checks: number
	discoveryChecks: number
	doubleChecks: number
	checkmates: number
}

const isCapture = (state: GameState, move: Move) => {
	const [toRank, toFile] = squareToCoords(move.to)
	const [fromRank, fromFile] = squareToCoords(move.from)
	const movingPiece = state.board[fromRank][fromFile]

	return (
		(movingPiece?.[1] === "p" && move.to === state.enPassantTarget) ||
		state.board[toRank][toFile] !== null
	)
}

const isCastle = (state: GameState, move: Move) => {
	const [fromRank, fromFile] = squareToCoords(move.from)
	const piece = state.board[fromRank][fromFile]
	if (!piece || piece[1] !== "k") return false

	return Math.abs(fromFile - squareToCoords(move.to)[1]) === 2
}

const isEnPassant = (state: GameState, move: Move) => {
	const [fromRank, fromFile] = squareToCoords(move.from)
	const movingPiece = state.board[fromRank][fromFile]
	return movingPiece?.[1] === "p" && move.to === state.enPassantTarget
}

const isPromotion = (move: Move) => move.promotion !== undefined

const isDiscoveryCheck = (state: GameState, move: Move) => {
	const [fromRank, fromFile] = squareToCoords(move.from)
	const movingPiece = state.board[fromRank][fromFile]
	if (!movingPiece) return false

	const tempState: GameState = {
		...state,
		board: state.board.map((rank) => [...rank])
	}
	tempState.board[fromRank][fromFile] = null

	const opponentColor = state.activeColor === "w" ? "b" : "w"
	const kingSquare = findKingSquare(state.board, opponentColor)

	return kingSquare
		? isSquareUnderAttack(tempState, kingSquare, opponentColor)
		: false
}

const findKingSquare = (
	board: GameState["board"],
	color: "w" | "b"
): Square | null => {
	for (let rank = 0; rank < 8; rank++) {
		for (let file = 0; file < 8; file++) {
			const piece = board[rank][file]
			if (piece && piece[0] === color && piece[1] === "k") {
				return coordsToSquare(rank, file)
			}
		}
	}
	return null
}

const isDoubleCheck = (game: ChessGame, move: Move) => {
	const state = game.getState()
	const [fromRank, fromFile] = squareToCoords(move.from)
	const movingPiece = state.board[fromRank][fromFile]
	if (!movingPiece) return false

	const tempGame = new ChessGame(toFen(state))
	if (!tempGame.makeMove(move)) return false

	const opponentColor = state.activeColor === "w" ? "b" : "w"
	const newState = tempGame.getState()
	const kingSquare = findKingSquare(newState.board, opponentColor)
	if (!kingSquare) return false

	let checkCount = 0
	for (let rank = 0; rank < 8; rank++) {
		for (let file = 0; file < 8; file++) {
			const piece = newState.board[rank][file]
			if (!piece || piece[0] !== state.activeColor) continue

			const square = coordsToSquare(rank, file)
			const moves = getValidMoves(newState, square)

			if (moves.some((m) => m.to === kingSquare)) {
				checkCount++
				if (checkCount > 1) return true
			}
		}
	}

	return false
}

export const perft = (state: GameState, depth: number): PerftResult => {
	if (depth === 0) {
		return {
			nodes: 1,
			captures: 0,
			enPassant: 0,
			castles: 0,
			promotions: 0,
			checks: 0,
			discoveryChecks: 0,
			doubleChecks: 0,
			checkmates: 0
		}
	}

	const result: PerftResult = {
		nodes: 0,
		captures: 0,
		enPassant: 0,
		castles: 0,
		promotions: 0,
		checks: 0,
		discoveryChecks: 0,
		doubleChecks: 0,
		checkmates: 0
	}

	for (let rank = 0; rank < 8; rank++) {
		for (let file = 0; file < 8; file++) {
			const piece = state.board[rank][file]
			if (!piece || piece[0] !== state.activeColor) continue

			const square = coordsToSquare(rank, file)
			const moves = getValidMoves(state, square)

			for (const move of moves) {
				const game = new ChessGame(toFen(state))
				if (!game.makeMove(move)) continue

				const newState = game.getState()
				const subPerft = perft(newState, depth - 1)

				result.nodes += subPerft.nodes

				if (depth === 1) {
					if (isCapture(state, move)) result.captures++
					if (isEnPassant(state, move)) result.enPassant++
					if (isCastle(state, move)) result.castles++
					if (isPromotion(move)) result.promotions++

					const status = game.getStatus()
					if (status === "check" || status === "checkmate") {
						result.checks++
						if (isDiscoveryCheck(state, move)) result.discoveryChecks++
						if (isDoubleCheck(game, move)) result.doubleChecks++
					}
					if (status === "checkmate") result.checkmates++
				} else {
					result.captures += subPerft.captures
					result.enPassant += subPerft.enPassant
					result.castles += subPerft.castles
					result.promotions += subPerft.promotions
					result.checks += subPerft.checks
					result.discoveryChecks += subPerft.discoveryChecks
					result.doubleChecks += subPerft.doubleChecks
					result.checkmates += subPerft.checkmates
				}
			}
		}
	}

	return result
}
