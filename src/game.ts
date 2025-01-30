import {
	type Move,
	coordsToSquare,
	getPieceAt,
	getRawMovesForPiece,
	getValidMoves,
	squareToCoords
} from "@/moves"
import {
	type Color,
	DEFAULT_FEN,
	type GameState,
	type Piece,
	type Square,
	parseFen,
	toFen
} from "@/state"

export type GameStatus = "active" | "check" | "checkmate" | "stalemate" | "draw"

export class ChessGame {
	private readonly state: GameState
	private moveHistory: Move[] = []

	constructor(fen: string = DEFAULT_FEN) {
		this.state = parseFen(fen)
	}

	public getState = () => ({ ...this.state })

	public getFen = () => toFen(this.state)

	public getMoveHistory = () => [...this.moveHistory]

	public getValidMoves = (square: Square) => getValidMoves(this.state, square)

	public getStatus() {
		const activeColor = this.state.activeColor
		let hasValidMoves = false
		let isInCheck = false

		for (let rank = 0; rank < 8; rank++) {
			for (let file = 0; file < 8; file++) {
				const square = coordsToSquare(rank, file)
				const piece = getPieceAt(this.state.board, square)
				if (!piece || piece[0] !== activeColor) continue

				const moves = this.getValidMoves(square)
				if (moves.length > 0) {
					hasValidMoves = true
					break
				}
			}
			if (hasValidMoves) break
		}

		// Find the king's position
		let kingSquare: Square | null = null
		for (let rank = 0; rank < 8; rank++) {
			for (let file = 0; file < 8; file++) {
				const square = coordsToSquare(rank, file)
				const piece = getPieceAt(this.state.board, square)
				if (piece && piece[0] === activeColor && piece[1] === "k") {
					kingSquare = square
					break
				}
			}
			if (kingSquare) break
		}

		// Check if king is in check
		if (kingSquare) {
			const tempState: GameState = {
				...this.state,
				activeColor: (activeColor === "w" ? "b" : "w") as Color
			}

			for (let rank = 0; rank < 8; rank++) {
				for (let file = 0; file < 8; file++) {
					const square = coordsToSquare(rank, file)
					const piece = getPieceAt(tempState.board, square)
					if (!piece || piece[0] === activeColor) continue

					const moves = getRawMovesForPiece(
						tempState,
						rank,
						file,
						piece[0] as Color
					)
					if (moves.some((m: Move) => m.to === kingSquare)) {
						isInCheck = true
						break
					}
				}
				if (isInCheck) break
			}
		}

		if (!hasValidMoves) {
			return isInCheck ? "checkmate" : "stalemate"
		}

		return isInCheck ? "check" : "active"
	}

	public makeMove(move: Move) {
		const validMoves = this.getValidMoves(move.from)
		if (
			!validMoves.some(
				(m) =>
					m.from === move.from &&
					m.to === move.to &&
					m.promotion === move.promotion
			)
		) {
			return false
		}

		const [fromRank, fromFile] = squareToCoords(move.from)
		const [toRank, toFile] = squareToCoords(move.to)
		const movingPiece = getPieceAt(this.state.board, move.from)

		if (!movingPiece) return false

		// Handle en passant capture
		if (movingPiece[1] === "p" && move.to === this.state.enPassantTarget) {
			this.state.board[fromRank][toFile] = null
		}

		// Update board position
		this.state.board[toRank][toFile] = move.promotion
			? (`${this.state.activeColor}${move.promotion}` as Piece)
			: movingPiece
		this.state.board[fromRank][fromFile] = null

		// Handle castling
		if (movingPiece[1] === "k") {
			if (move.from === "e1" && move.to === "g1") {
				// White kingside
				this.state.board[7][7] = null
				this.state.board[7][5] = "wr"
			} else if (move.from === "e1" && move.to === "c1") {
				// White queenside
				this.state.board[7][0] = null
				this.state.board[7][3] = "wr"
			} else if (move.from === "e8" && move.to === "g8") {
				// Black kingside
				this.state.board[0][7] = null
				this.state.board[0][5] = "br"
			} else if (move.from === "e8" && move.to === "c8") {
				// Black queenside
				this.state.board[0][0] = null
				this.state.board[0][3] = "br"
			}
		}

		// Update castling rights
		if (movingPiece[1] === "k") {
			if (this.state.activeColor === "w") {
				this.state.castling.whiteKingSide = false
				this.state.castling.whiteQueenSide = false
			} else {
				this.state.castling.blackKingSide = false
				this.state.castling.blackQueenSide = false
			}
		} else if (movingPiece[1] === "r") {
			if (move.from === "a1") this.state.castling.whiteQueenSide = false
			if (move.from === "h1") this.state.castling.whiteKingSide = false
			if (move.from === "a8") this.state.castling.blackQueenSide = false
			if (move.from === "h8") this.state.castling.blackKingSide = false
		}

		// Update en passant target
		if (movingPiece[1] === "p" && Math.abs(toRank - fromRank) === 2) {
			const enPassantRank = (fromRank + toRank) / 2
			this.state.enPassantTarget =
				`${String.fromCharCode(fromFile + 97)}${8 - enPassantRank}` as Square
		} else {
			this.state.enPassantTarget = null
		}

		// Update move clocks
		if (movingPiece[1] === "p" || this.state.board[toRank][toFile] !== null) {
			this.state.halfmoveClock = 0
		} else {
			this.state.halfmoveClock++
		}

		if (this.state.activeColor === "b") {
			this.state.fullmoveNumber++
		}

		this.state.activeColor = (
			this.state.activeColor === "w" ? "b" : "w"
		) as Color

		// Handle captured rooks for castling rights
		const capturedPiece = getPieceAt(this.state.board, move.to)
		if (capturedPiece?.[1] === "r") {
			switch (move.to) {
				case "a1":
					this.state.castling.whiteQueenSide = false
					break
				case "h1":
					this.state.castling.whiteKingSide = false
					break
				case "a8":
					this.state.castling.blackQueenSide = false
					break
				case "h8":
					this.state.castling.blackKingSide = false
					break
			}
		}

		this.moveHistory.push(move)

		return true
	}
}
