import type { Color, GameState, Piece, Square } from "@/state"

export type Move = {
	from: Square
	to: Square
	promotion?: "q" | "r" | "b" | "n"
}

export type Position = {
	piece: Piece
	square: Square
}

const fileToIndex = (file: string) => file.charCodeAt(0) - "a".charCodeAt(0)

const rankToIndex = (rank: string) => 8 - Number.parseInt(rank)

const indexToFile = (index: number) =>
	String.fromCharCode(index + "a".charCodeAt(0))

const indexToRank = (index: number, boardSize: number) =>
	(boardSize - index).toString()

export const squareToCoords = (square: Square) => {
	const [file, ...rankDigits] = square.split("")
	const rank = rankDigits.join("")
	return [rankToIndex(rank), fileToIndex(file)]
}

export const coordsToSquare = (rank: number, file: number, boardSize: number) =>
	`${indexToFile(file)}${indexToRank(rank, boardSize)}` as Square

export const isInBounds = (rank: number, file: number, boardSize: number) =>
	rank >= 0 && rank < boardSize && file >= 0 && file < boardSize

export const getPieceAt = (board: GameState["board"], square: Square) => {
	const [rank, file] = squareToCoords(square)
	return board[rank][file]
}

export const getAllValidMoves = (state: GameState) => {
	const moves: Move[] = []

	for (let rank = 0; rank < state.boardSize; rank++) {
		for (let file = 0; file < state.boardSize; file++) {
			const piece = state.board[rank][file]
			if (!piece || piece[0] !== state.activeColor) continue

			const square = coordsToSquare(rank, file, state.boardSize)
			moves.push(...getValidMoves(state, square))
		}
	}

	return moves
}

export const getValidMoves = (state: GameState, square: Square) => {
	const piece = getPieceAt(state.board, square)
	if (!piece || piece[0] !== state.activeColor) return []

	const [color, type] = piece
	const [rank, file] = squareToCoords(square)
	const moves: Move[] = []

	switch (type) {
		case "p":
			moves.push(...getPawnMoves(state, rank, file, color as Color))
			break
		case "n":
			moves.push(...getKnightMoves(state, rank, file, color as Color))
			break
		case "b":
			moves.push(...getBishopMoves(state, rank, file, color as Color))
			break
		case "r":
			moves.push(...getRookMoves(state, rank, file, color as Color))
			break
		case "q":
			moves.push(...getQueenMoves(state, rank, file, color as Color))
			break
		case "k":
			moves.push(...getKingMoves(state, rank, file, color as Color))
			break
	}

	return moves.filter((move) => !movePutsKingInCheck(state, move))
}

const getPawnMoves = (
	state: GameState,
	rank: number,
	file: number,
	color: Color
) => {
	const moves: Move[] = []
	const direction = color === "w" ? -1 : 1
	const startRank = color === "w" ? 6 : 1
	const promotionRank = color === "w" ? 0 : 7

	const newRank = rank + direction
	const forwardSquare = coordsToSquare(newRank, file, state.boardSize)

	if (
		isInBounds(newRank, file, state.boardSize) &&
		!getPieceAt(state.board, forwardSquare)
	) {
		if (newRank === promotionRank) {
			for (const piece of ["q", "r", "b", "n"] as const) {
				moves.push({
					from: coordsToSquare(rank, file, state.boardSize),
					to: forwardSquare,
					promotion: piece
				})
			}
		} else {
			moves.push({
				from: coordsToSquare(rank, file, state.boardSize),
				to: forwardSquare
			})

			if (
				rank === startRank &&
				!getPieceAt(
					state.board,
					coordsToSquare(rank + direction * 2, file, state.boardSize)
				)
			) {
				moves.push({
					from: coordsToSquare(rank, file, state.boardSize),
					to: coordsToSquare(rank + direction * 2, file, state.boardSize)
				})
			}
		}
	}

	for (const captureFile of [file - 1, file + 1]) {
		if (!isInBounds(newRank, captureFile, state.boardSize)) continue

		const targetSquare = coordsToSquare(newRank, captureFile, state.boardSize)
		const targetPiece = getPieceAt(state.board, targetSquare)

		if (targetSquare === state.enPassantTarget) {
			const correctRank = color === "w" ? 3 : 4
			if (rank !== correctRank) continue

			const capturedPawn = getPieceAt(
				state.board,
				coordsToSquare(rank, captureFile, state.boardSize)
			)

			if (capturedPawn?.[1] === "p" && capturedPawn?.[0] !== color) {
				moves.push({
					from: coordsToSquare(rank, file, state.boardSize),
					to: targetSquare
				})
			}
		} else if (targetPiece && targetPiece[0] !== color) {
			if (newRank === promotionRank) {
				for (const piece of ["q", "r", "b", "n"] as const) {
					moves.push({
						from: coordsToSquare(rank, file, state.boardSize),
						to: targetSquare,
						promotion: piece
					})
				}
			} else {
				moves.push({
					from: coordsToSquare(rank, file, state.boardSize),
					to: targetSquare
				})
			}
		}
	}

	return moves
}

const KNIGHT_OFFSETS: [number, number][] = [
	[-2, -1],
	[-2, 1],
	[-1, -2],
	[-1, 2],
	[1, -2],
	[1, 2],
	[2, -1],
	[2, 1]
]

const getKnightMoves = (
	state: GameState,
	rank: number,
	file: number,
	color: Color
) => {
	const moves: Move[] = []

	for (const [dRank, dFile] of KNIGHT_OFFSETS) {
		const newRank = rank + dRank
		const newFile = file + dFile

		if (!isInBounds(newRank, newFile, state.boardSize)) continue

		const targetSquare = coordsToSquare(newRank, newFile, state.boardSize)
		const targetPiece = getPieceAt(state.board, targetSquare)

		if (!targetPiece || targetPiece[0] !== color) {
			moves.push({
				from: coordsToSquare(rank, file, state.boardSize),
				to: targetSquare
			})
		}
	}

	return moves
}

const getSlidingMoves = (
	state: GameState,
	rank: number,
	file: number,
	directions: [number, number][],
	color: Color
) => {
	const moves: Move[] = []

	for (const [dRank, dFile] of directions) {
		let newRank = rank + dRank
		let newFile = file + dFile

		while (isInBounds(newRank, newFile, state.boardSize)) {
			const targetSquare = coordsToSquare(newRank, newFile, state.boardSize)
			const targetPiece = getPieceAt(state.board, targetSquare)

			if (!targetPiece) {
				moves.push({
					from: coordsToSquare(rank, file, state.boardSize),
					to: targetSquare
				})
			} else {
				if (targetPiece[0] !== color) {
					moves.push({
						from: coordsToSquare(rank, file, state.boardSize),
						to: targetSquare
					})
				}
				break
			}

			newRank += dRank
			newFile += dFile
		}
	}

	return moves
}

const BISHOP_DIRECTIONS: [number, number][] = [
	[-1, -1],
	[-1, 1],
	[1, -1],
	[1, 1]
]
const ROOK_DIRECTIONS: [number, number][] = [
	[-1, 0],
	[1, 0],
	[0, -1],
	[0, 1]
]
const KING_OFFSETS: [number, number][] = [
	[-1, -1],
	[-1, 0],
	[-1, 1],
	[0, -1],
	[0, 1],
	[1, -1],
	[1, 0],
	[1, 1]
]

const getBishopMoves = (
	state: GameState,
	rank: number,
	file: number,
	color: Color
) => getSlidingMoves(state, rank, file, BISHOP_DIRECTIONS, color)

const getRookMoves = (
	state: GameState,
	rank: number,
	file: number,
	color: Color
) => getSlidingMoves(state, rank, file, ROOK_DIRECTIONS, color)

const getQueenMoves = (
	state: GameState,
	rank: number,
	file: number,
	color: Color
) =>
	getSlidingMoves(
		state,
		rank,
		file,
		[...BISHOP_DIRECTIONS, ...ROOK_DIRECTIONS],
		color
	)

const getKingMoves = (
	state: GameState,
	rank: number,
	file: number,
	color: Color,
	includeCastling = true
) => {
	const moves: Move[] = []

	for (const [dRank, dFile] of KING_OFFSETS) {
		const newRank = rank + dRank
		const newFile = file + dFile

		if (!isInBounds(newRank, newFile, state.boardSize)) continue

		const targetSquare = coordsToSquare(newRank, newFile, state.boardSize)
		const targetPiece = getPieceAt(state.board, targetSquare)

		if (!targetPiece || targetPiece[0] !== color) {
			moves.push({
				from: coordsToSquare(rank, file, state.boardSize),
				to: targetSquare
			})
		}
	}

	if (!includeCastling) return moves

	if (color === "w") {
		if (state.castling.whiteKingSide && canCastleKingSide(state, "w")) {
			moves.push({
				from: "e1",
				to: "g1"
			})
		}
		if (state.castling.whiteQueenSide && canCastleQueenSide(state, "w")) {
			moves.push({
				from: "e1",
				to: "c1"
			})
		}
	} else {
		if (state.castling.blackKingSide && canCastleKingSide(state, "b")) {
			moves.push({
				from: "e8",
				to: "g8"
			})
		}
		if (state.castling.blackQueenSide && canCastleQueenSide(state, "b")) {
			moves.push({
				from: "e8",
				to: "c8"
			})
		}
	}

	return moves
}

const canCastleKingSide = (state: GameState, color: Color) => {
	const squares = color === "w" ? ["f1", "g1"] : ["f8", "g8"]
	const kingSquare = color === "w" ? "e1" : "e8"
	const rookSquare = color === "w" ? "h1" : "h8"

	if (!getPieceAt(state.board, rookSquare as Square)?.startsWith(`${color}r`)) {
		return false
	}

	return (
		squares.every((square) => !getPieceAt(state.board, square as Square)) &&
		!isSquareUnderAttack(state, kingSquare as Square, color, state.boardSize) &&
		squares.every(
			(square) =>
				!isSquareUnderAttack(state, square as Square, color, state.boardSize)
		)
	)
}

const canCastleQueenSide = (state: GameState, color: Color) => {
	const squares = color === "w" ? ["d1", "c1", "b1"] : ["d8", "c8", "b8"]
	const kingSquare = color === "w" ? "e1" : "e8"
	const checkSquares = color === "w" ? ["d1", "c1"] : ["d8", "c8"]
	const rookSquare = color === "w" ? "a1" : "a8"

	if (!getPieceAt(state.board, rookSquare as Square)?.startsWith(`${color}r`)) {
		return false
	}

	return (
		squares.every((square) => !getPieceAt(state.board, square as Square)) &&
		!isSquareUnderAttack(state, kingSquare as Square, color, state.boardSize) &&
		checkSquares.every(
			(square) =>
				!isSquareUnderAttack(state, square as Square, color, state.boardSize)
		)
	)
}

export const isSquareUnderAttack = (
	state: GameState,
	square: Square,
	defendingColor: Color,
	boardSize: number
) => {
	const tempState: GameState = {
		...state,
		activeColor: defendingColor === "w" ? "b" : "w"
	}

	for (let rank = 0; rank < boardSize; rank++) {
		for (let file = 0; file < boardSize; file++) {
			const piece = tempState.board[rank][file]
			if (!piece || piece[0] === defendingColor) continue

			const moves = getRawMovesForPiece(
				tempState,
				rank,
				file,
				piece[0] as Color,
				false // Don't include castling moves when checking for attacks
			)

			if (moves.some((m) => m.to === square)) {
				return true
			}
		}
	}
	return false
}

export const getRawMovesForPiece = (
	state: GameState,
	rank: number,
	file: number,
	color: Color,
	includeCastling = true
) => {
	const piece = state.board[rank][file]
	if (!piece) return []

	switch (piece[1]) {
		case "p":
			return getPawnMoves(state, rank, file, color)
		case "n":
			return getKnightMoves(state, rank, file, color)
		case "b":
			return getBishopMoves(state, rank, file, color)
		case "r":
			return getRookMoves(state, rank, file, color)
		case "q":
			return getQueenMoves(state, rank, file, color)
		case "k":
			return getKingMoves(state, rank, file, color, includeCastling)
		default:
			return []
	}
}

const movePutsKingInCheck = (state: GameState, move: Move) => {
	const newBoard = state.board.map((rank) => [...rank])
	const [fromRank, fromFile] = squareToCoords(move.from)
	const [toRank, toFile] = squareToCoords(move.to)
	const movingPiece = newBoard[fromRank][fromFile]

	if (
		movingPiece &&
		movingPiece[1] === "p" &&
		move.to === state.enPassantTarget
	) {
		newBoard[fromRank][toFile] = null
	}

	newBoard[toRank][toFile] = newBoard[fromRank][fromFile]
	newBoard[fromRank][fromFile] = null

	if (move.promotion) {
		newBoard[toRank][toFile] = `${state.activeColor}${move.promotion}` as Piece
	}

	let kingSquare: Square | null = null

	if (movingPiece && movingPiece[1] === "k") {
		kingSquare = move.to
	} else {
		for (let rank = 0; rank < state.boardSize; rank++) {
			for (let file = 0; file < state.boardSize; file++) {
				const piece = newBoard[rank][file]
				if (piece && piece[0] === state.activeColor && piece[1] === "k") {
					kingSquare = coordsToSquare(rank, file, state.boardSize)
					break
				}
			}
			if (kingSquare) break
		}
	}

	if (!kingSquare) return true

	const newState: GameState = {
		...state,
		board: newBoard,
		activeColor: state.activeColor === "w" ? "b" : "w"
	}

	return isSquareUnderAttack(
		newState,
		kingSquare,
		state.activeColor,
		state.boardSize
	)
}

export const getAllCaptureMoves = (state: GameState) => {
	const moves = getAllValidMoves(state)
	return moves.filter((move) => {
		// Check for regular captures
		const targetPiece = getPieceAt(state.board, move.to)
		if (targetPiece && targetPiece[0] !== state.activeColor) return true

		// Check for en passant captures
		if (move.to === state.enPassantTarget) {
			const [fromRank, fromFile] = squareToCoords(move.from)
			const piece = state.board[fromRank][fromFile]
			return piece?.[1] === "p"
		}

		return false
	})
}

export const getAllNonCaptureMoves = (state: GameState) => {
	const moves = getAllValidMoves(state)
	return moves.filter((move) => {
		// Check for regular captures
		const targetPiece = getPieceAt(state.board, move.to)
		if (targetPiece && targetPiece[0] !== state.activeColor) return false

		// Check for en passant captures
		if (move.to === state.enPassantTarget) {
			const [fromRank, fromFile] = squareToCoords(move.from)
			const piece = state.board[fromRank][fromFile]
			return !(piece?.[1] === "p")
		}

		return true
	})
}

export const moveToAlgebraic = (state: GameState, move: Move): string => {
	const [fromRank, fromFile] = squareToCoords(move.from)
	const piece = state.board[fromRank][fromFile]
	if (!piece) return ""

	// Handle castling
	if (piece[1] === "k") {
		if (move.from === "e1" && move.to === "g1") return "O-O"
		if (move.from === "e1" && move.to === "c1") return "O-O-O"
		if (move.from === "e8" && move.to === "g8") return "O-O"
		if (move.from === "e8" && move.to === "c8") return "O-O-O"
	}

	let notation = ""
	const pieceType = piece[1]
	const isCapture =
		getPieceAt(state.board, move.to) !== null ||
		(pieceType === "p" && move.to === state.enPassantTarget)

	// For pawns, we need to add the file when capturing
	if (pieceType === "p") {
		if (isCapture || move.from[0] !== move.to[0]) {
			notation += move.from[0]
			notation += "x"
		}
	} else {
		// Add piece letter for non-pawn moves
		notation += pieceType.toUpperCase()

		// Handle disambiguation
		const ambiguousMoves = getAllValidMoves(state).filter((m) => {
			if (m.to !== move.to) return false
			const [r, f] = squareToCoords(m.from)
			const p = state.board[r][f]
			return p?.[1] === pieceType && m.from !== move.from
		})

		if (ambiguousMoves.length > 0) {
			const sameFile = ambiguousMoves.some((m) => {
				const [, f] = squareToCoords(m.from)
				return f === fromFile
			})
			const sameRank = ambiguousMoves.some((m) => {
				const [r] = squareToCoords(m.from)
				return r === fromRank
			})

			// If there are pieces on the same file or same rank, or multiple ambiguous pieces,
			// we need to be more specific with disambiguation
			if (sameFile || sameRank || ambiguousMoves.length > 1) {
				notation += move.from // Add both file and rank for full disambiguation
			} else {
				notation += move.from[0] // Add file by default for simple cases
			}
		}

		// Add capture notation for non-pawn pieces
		if (isCapture) {
			notation += "x"
		}
	}

	// Add destination square
	notation += move.to

	// Handle promotion
	if (move.promotion) {
		notation += `=${move.promotion.toUpperCase()}`
	}

	return notation
}

export const movesToAlgebraic = (state: GameState, moves: Move[]): string[] => {
	return moves.map((move) => moveToAlgebraic(state, move))
}
