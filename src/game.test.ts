import { ChessGame } from "@/game"
import type { Move } from "@/moves"
import { describe, expect, it } from "vitest"

describe("ChessGame", () => {
	describe("Initial state", () => {
		it("should initialize with default position", () => {
			const game = new ChessGame()
			const state = game.getState()

			expect(state.activeColor).toBe("w")
			expect(state.fullmoveNumber).toBe(1)
			expect(state.halfmoveClock).toBe(0)
			expect(state.castling).toEqual({
				whiteKingSide: true,
				whiteQueenSide: true,
				blackKingSide: true,
				blackQueenSide: true
			})
			expect(state.enPassantTarget).toBeNull()
		})

		it("should initialize from custom FEN", () => {
			const customFen =
				"rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"
			const game = new ChessGame(customFen)

			expect(game.getFen()).toBe(customFen)
			expect(game.getState().activeColor).toBe("b")
			expect(game.getState().fullmoveNumber).toBe(2)
		})
	})

	describe("Move validation", () => {
		it("should validate legal moves", () => {
			const game = new ChessGame()
			const validMoves = game.getValidMoves("e2")

			expect(validMoves).toContainEqual(
				expect.objectContaining({ from: "e2", to: "e3" })
			)
			expect(validMoves).toContainEqual(
				expect.objectContaining({ from: "e2", to: "e4" })
			)
		})

		it("should reject illegal moves", () => {
			const game = new ChessGame()
			const illegalMove: Move = { from: "e2", to: "e6" }

			expect(game.makeMove(illegalMove)).toBe(false)
		})
	})

	describe("Special moves", () => {
		it("should handle kingside castling", () => {
			const game = new ChessGame(
				"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w KQkq - 0 1"
			)
			const castlingMove: Move = { from: "e1", to: "g1" }

			expect(game.makeMove(castlingMove)).toBe(true)
			const state = game.getState()
			expect(state.board[7][6]).toBe("wk") // King moved
			expect(state.board[7][5]).toBe("wr") // Rook moved
		})

		it("should handle pawn promotion", () => {
			const game = new ChessGame(
				"rnbqkbn1/pppppppP/8/8/8/8/PPPPPPP1/RNBQKBNR w KQkq - 0 1"
			)
			const promotionMove: Move = { from: "h7", to: "h8", promotion: "q" }

			expect(game.makeMove(promotionMove)).toBe(true)
			expect(game.getState().board[0][7]).toBe("wq")
		})
	})

	describe("Game status", () => {
		it("should detect check", () => {
			const game = new ChessGame("4r3/8/8/8/8/8/8/4K3 w - - 0 1")
			expect(game.getStatus()).toBe("check")
		})

		it("should detect checkmate", () => {
			const game = new ChessGame(
				"rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 1"
			)
			game.makeMove({ from: "f3", to: "f4" })
			game.makeMove({ from: "h4", to: "f2" })
			expect(game.getStatus()).toBe("checkmate")
		})
	})

	describe("Move history", () => {
		it("should track move history", () => {
			const game = new ChessGame()
			const moves: Move[] = [
				{ from: "e2", to: "e4" },
				{ from: "e7", to: "e5" },
				{ from: "g1", to: "f3" }
			]

			for (const move of moves) {
				game.makeMove(move)
			}
			const history = game.getMoveHistory()

			expect(history).toHaveLength(3)
			expect(history).toEqual(moves)
		})
	})
})
