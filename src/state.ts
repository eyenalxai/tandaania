export type Color = "w" | "b"

export type PieceType = "p" | "n" | "b" | "r" | "q" | "k"

export type Piece = `${Color}${PieceType}`

export type File =
	| "a"
	| "b"
	| "c"
	| "d"
	| "e"
	| "f"
	| "g"
	| "h"
	| "i"
	| "j"
	| "k"
	| "l"
	| "m"
	| "n"
	| "o"
	| "p"

export type Rank =
	| "1"
	| "2"
	| "3"
	| "4"
	| "5"
	| "6"
	| "7"
	| "8"
	| "9"
	| "10"
	| "11"
	| "12"
	| "13"
	| "14"
	| "15"
	| "16"

export type Square = `${File}${Rank}`

export type GameState = {
	board: (Piece | null)[][]
	boardSize: number
	activeColor: Color
	castling: {
		whiteKingSide: boolean
		whiteQueenSide: boolean
		blackKingSide: boolean
		blackQueenSide: boolean
	}
	enPassantTarget: Square | null
	halfmoveClock: number
	fullmoveNumber: number
}

export const DEFAULT_FEN =
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

export const isPiece = (char: string) => {
	const validPieces = ["p", "n", "b", "r", "q", "k"]
	const color = char === char.toUpperCase() ? "w" : "b"
	const pieceType = char.toLowerCase() as PieceType

	return (
		validPieces.includes(pieceType) &&
		((color === "w" && char === char.toUpperCase()) ||
			(color === "b" && char === char.toLowerCase()))
	)
}

export const isSquare = (square: string, boardSize = 8) => {
	if (square.length < 2 || square.length > 3) return false
	if (boardSize < 8 || boardSize > 16) return false
	const [file, ...rankDigits] = square.split("")
	const rank = rankDigits.join("")
	const validFiles = "abcdefghijklmnop".slice(0, boardSize)
	const validRanks = Array.from({ length: boardSize }, (_, i) =>
		(i + 1).toString()
	)
	return validFiles.includes(file) && validRanks.includes(rank)
}

export const charToPiece = (char: string): Piece => {
	if (!isPiece(char)) throw new Error(`Invalid piece character: ${char}`)
	const color: Color = char === char.toUpperCase() ? "w" : "b"
	const pieceType: PieceType = char.toLowerCase() as PieceType
	return `${color}${pieceType}` as Piece
}

const isValidEnPassantSquare = (square: Square) => {
	const rank = square[1]
	return rank === "3" || rank === "6"
}

const isValidCastlingString = (castling: string) =>
	castling === "-" ||
	([...castling].every((char) => "KQkq".includes(char)) &&
		new Set(castling).size === castling.length)

export const parseFen = (fen: string, boardSize = 8): GameState => {
	const [position, activeColor, castling, enPassant, halfmove, fullmove] =
		fen.split(" ")

	if (fen.split(" ").length !== 6) {
		throw new Error("Invalid FEN: must contain 6 parts")
	}

	if (boardSize < 8 || boardSize > 16) {
		throw new Error("Invalid board size: must be between 8 and 16")
	}

	const board: (Piece | null)[][] = []
	const ranks = position.split("/")

	if (ranks.length !== boardSize) {
		throw new Error(`Invalid FEN: board must have ${boardSize} ranks`)
	}

	for (const rank of ranks) {
		const row: (Piece | null)[] = []

		for (let i = 0; i < rank.length; i++) {
			const char = rank[i]
			const emptySquares = Number.parseInt(char)
			if (Number.isNaN(emptySquares)) {
				row.push(charToPiece(char))
			} else {
				if (emptySquares < 1 || emptySquares > boardSize) {
					throw new Error(
						`Invalid FEN: number of empty squares must be between 1 and ${boardSize}, got ${emptySquares}`
					)
				}
				row.push(...Array(emptySquares).fill(null))
			}
		}

		if (row.length !== boardSize) {
			throw new Error(`Invalid FEN: each rank must have ${boardSize} squares`)
		}

		board.push(row)
	}

	if (activeColor !== "w" && activeColor !== "b") {
		throw new Error('Invalid FEN: active color must be "w" or "b"')
	}

	if (!isValidCastlingString(castling)) {
		throw new Error(`Invalid FEN: invalid castling rights '${castling}'`)
	}

	const castlingRights = {
		whiteKingSide: castling.includes("K"),
		whiteQueenSide: castling.includes("Q"),
		blackKingSide: castling.includes("k"),
		blackQueenSide: castling.includes("q")
	}

	if (enPassant !== "-") {
		if (!isSquare(enPassant)) {
			throw new Error(`Invalid FEN: invalid en passant square '${enPassant}'`)
		}

		if (!isValidEnPassantSquare(enPassant as Square)) {
			throw new Error("Invalid FEN: en passant square must be on rank 3 or 6")
		}
	}

	const enPassantTarget = enPassant === "-" ? null : (enPassant as Square)
	const halfmoveClock = Number.parseInt(halfmove)
	const fullmoveNumber = Number.parseInt(fullmove)

	if (Number.isNaN(halfmoveClock) || Number.isNaN(fullmoveNumber)) {
		throw new Error("Invalid FEN: move numbers must be integers")
	}

	if (halfmoveClock < 0 || fullmoveNumber < 1) {
		throw new Error("Invalid FEN: move numbers must be non-negative")
	}

	if (halfmove.includes(".") || fullmove.includes(".")) {
		throw new Error("Invalid FEN: move numbers must be integers")
	}

	return {
		board,
		boardSize,
		activeColor: activeColor as Color,
		castling: castlingRights,
		enPassantTarget,
		halfmoveClock,
		fullmoveNumber
	}
}

export const toFen = (state: GameState): string => {
	const position = state.board
		.map((rank) =>
			rank.reduce((acc, piece) => {
				if (piece === null) {
					const lastChar = acc[acc.length - 1]
					if (lastChar && !Number.isNaN(Number.parseInt(lastChar))) {
						return `${acc.slice(0, -1)}${Number.parseInt(lastChar) + 1}`
					}
					return `${acc}1`
				}

				const [color, type] = piece
				return `${acc}${color === "w" ? type.toUpperCase() : type}`
			}, "")
		)
		.join("/")

	const castling =
		`${state.castling.whiteKingSide ? "K" : ""}${
			state.castling.whiteQueenSide ? "Q" : ""
		}${state.castling.blackKingSide ? "k" : ""}${
			state.castling.blackQueenSide ? "q" : ""
		}` || "-"

	return [
		position,
		state.activeColor,
		castling,
		state.enPassantTarget || "-",
		state.halfmoveClock,
		state.fullmoveNumber
	].join(" ")
}
