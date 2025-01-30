import {
	type Move,
	coordsToSquare,
	getAllValidMoves,
	getPieceAt,
	getValidMoves,
	isSquareUnderAttack,
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

	private findKingPosition(color: Color): Square | null {
		for (let rank = 0; rank < 8; rank++) {
			for (let file = 0; file < 8; file++) {
				const square = coordsToSquare(rank, file)
				const piece = getPieceAt(this.state.board, square)
				if (piece && piece[0] === color && piece[1] === "k") {
					return square
				}
			}
		}
		return null
	}

	private updateCastlingRights(piece: Piece, from: Square, to: Square) {
		if (piece[1] === "k") {
			if (piece[0] === "w") {
				this.state.castling.whiteKingSide = false
				this.state.castling.whiteQueenSide = false
			} else {
				this.state.castling.blackKingSide = false
				this.state.castling.blackQueenSide = false
			}
		} else if (piece[1] === "r") {
			if (from === "a1") this.state.castling.whiteQueenSide = false
			if (from === "h1") this.state.castling.whiteKingSide = false
			if (from === "a8") this.state.castling.blackQueenSide = false
			if (from === "h8") this.state.castling.blackKingSide = false
		}

		// Handle captured rooks
		const capturedPiece = getPieceAt(this.state.board, to)
		if (capturedPiece?.[1] === "r") {
			switch (to) {
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
	}

	private handleCastling(piece: Piece, from: Square, to: Square) {
		if (piece[1] !== "k") return

		if (from === "e1" && to === "g1") {
			// White kingside
			this.state.board[7][7] = null
			this.state.board[7][5] = "wr"
		} else if (from === "e1" && to === "c1") {
			// White queenside
			this.state.board[7][0] = null
			this.state.board[7][3] = "wr"
		} else if (from === "e8" && to === "g8") {
			// Black kingside
			this.state.board[0][7] = null
			this.state.board[0][5] = "br"
		} else if (from === "e8" && to === "c8") {
			// Black queenside
			this.state.board[0][0] = null
			this.state.board[0][3] = "br"
		}
	}

	private updateEnPassantTarget(
		piece: Piece,
		fromRank: number,
		toRank: number,
		fromFile: number
	) {
		if (piece[1] === "p" && Math.abs(toRank - fromRank) === 2) {
			const enPassantRank = (fromRank + toRank) / 2
			this.state.enPassantTarget =
				`${String.fromCharCode(fromFile + 97)}${8 - enPassantRank}` as Square
		} else {
			this.state.enPassantTarget = null
		}
	}

	public getStatus() {
		const activeColor = this.state.activeColor
		const hasValidMoves = getAllValidMoves(this.state).length > 0
		const kingSquare = this.findKingPosition(activeColor)
		const isInCheck = kingSquare
			? isSquareUnderAttack(this.state, kingSquare, activeColor)
			: false

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
		this.handleCastling(movingPiece, move.from, move.to)

		// Update castling rights
		this.updateCastlingRights(movingPiece, move.from, move.to)

		// Update en passant target
		this.updateEnPassantTarget(movingPiece, fromRank, toRank, fromFile)

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

		this.moveHistory.push(move)

		return true
	}
}
