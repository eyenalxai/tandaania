import { type Move, getValidMoves, moveToAlgebraic } from "@/moves"
import { type Square, parseFen } from "@/state"
import { describe, expect, it } from "vitest"

const expectMoves = (
	fen: string,
	square: Square,
	expectedMoves: Move[],
	boardSize = 8
) => {
	const state = parseFen(fen, boardSize)
	const moves = getValidMoves(state, square)
	expect(new Set(moves.map((m) => JSON.stringify(m)))).toEqual(
		new Set(expectedMoves.map((m) => JSON.stringify(m)))
	)
}

const expectAlgebraic = (
	fen: string,
	move: Move,
	expected: string,
	boardSize = 8
) => {
	const state = parseFen(fen, boardSize)
	expect(moveToAlgebraic(state, move)).toBe(expected)
}

describe("getValidMoves", () => {
	describe("pawns", () => {
		it("should generate basic pawn moves", () => {
			// White pawn initial position
			expectMoves(
				"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
				"e2",
				[
					{ from: "e2", to: "e3" },
					{ from: "e2", to: "e4" }
				]
			)

			// Black pawn initial position
			expectMoves(
				"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1",
				"e7",
				[
					{ from: "e7", to: "e6" },
					{ from: "e7", to: "e5" }
				]
			)
		})

		it("should generate pawn captures", () => {
			expectMoves(
				"rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
				"e4",
				[
					{ from: "e4", to: "e5" },
					{ from: "e4", to: "d5" }
				]
			)
		})

		it("should handle en passant", () => {
			expectMoves(
				"rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 1",
				"e5",
				[
					{ from: "e5", to: "e6" },
					{ from: "e5", to: "f6" }
				]
			)
		})

		it("should handle pawn promotion", () => {
			expectMoves(
				"rnbqkb2/pppppp1P/8/8/8/8/PPPPPP2/RNBQKBNR w KQkq - 0 1",
				"h7",
				[
					{ from: "h7", to: "h8", promotion: "q" },
					{ from: "h7", to: "h8", promotion: "r" },
					{ from: "h7", to: "h8", promotion: "b" },
					{ from: "h7", to: "h8", promotion: "n" }
				]
			)
		})
	})

	describe("knights", () => {
		it("should generate knight moves", () => {
			expectMoves(
				"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
				"b1",
				[
					{ from: "b1", to: "a3" },
					{ from: "b1", to: "c3" }
				]
			)
		})

		it("should handle knight captures", () => {
			expectMoves(
				"rnbqkbnr/pppp1ppp/8/4p3/3N4/8/PPPPPPPP/RNBQKB1R w KQkq - 0 1",
				"d4",
				[
					{ from: "d4", to: "b5" },
					{ from: "d4", to: "c6" },
					{ from: "d4", to: "e6" },
					{ from: "d4", to: "f5" },
					{ from: "d4", to: "f3" },
					{ from: "d4", to: "b3" }
				]
			)
		})
	})

	describe("bishops", () => {
		it("should generate bishop moves", () => {
			expectMoves(
				"rnbqkbnr/pppp1ppp/8/4p3/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
				"f1",
				[
					{ from: "f1", to: "e2" },
					{ from: "f1", to: "d3" },
					{ from: "f1", to: "c4" },
					{ from: "f1", to: "b5" },
					{ from: "f1", to: "a6" }
				]
			)
		})
	})

	describe("rooks", () => {
		it("should generate rook moves", () => {
			expectMoves("rnbqkbnr/1ppppppp/p7/8/8/8/8/RNBQKBNR w KQkq - 0 1", "a1", [
				{ from: "a1", to: "a2" },
				{ from: "a1", to: "a3" },
				{ from: "a1", to: "a4" },
				{ from: "a1", to: "a5" },
				{ from: "a1", to: "a6" }
			])
		})
	})

	describe("queens", () => {
		it("should generate queen moves", () => {
			expectMoves(
				"rnbqkbnr/pppp1ppp/8/4p3/3Q4/8/PPPPPPPP/RNB1KBNR w KQkq - 0 1",
				"d4",
				[
					// Vertical moves
					{ from: "d4", to: "d3" },
					{ from: "d4", to: "d5" },
					{ from: "d4", to: "d6" },
					{ from: "d4", to: "d7" },
					// Diagonal moves
					{ from: "d4", to: "c3" },
					{ from: "d4", to: "e5" },
					{ from: "d4", to: "c5" },
					{ from: "d4", to: "e3" },
					{ from: "d4", to: "b6" },
					{ from: "d4", to: "a7" },
					// Horizontal moves
					{ from: "d4", to: "c4" },
					{ from: "d4", to: "b4" },
					{ from: "d4", to: "a4" },
					{ from: "d4", to: "e4" },
					{ from: "d4", to: "f4" },
					{ from: "d4", to: "g4" },
					{ from: "d4", to: "h4" }
				]
			)
		})
	})

	describe("kings", () => {
		it("should generate basic king moves", () => {
			expectMoves(
				"rnbqkbnr/pppp1ppp/8/4p3/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
				"e1",
				[{ from: "e1", to: "e2" }]
			)
		})

		it("should handle kingside castling", () => {
			expectMoves(
				"rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQK2R w KQkq - 0 1",
				"e1",
				[
					{ from: "e1", to: "e2" },
					{ from: "e1", to: "f1" },
					{ from: "e1", to: "g1" }
				]
			)
		})

		it("should handle queenside castling", () => {
			expectMoves(
				"rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/R3KBNR w KQkq - 0 1",
				"e1",
				[
					{ from: "e1", to: "d1" },
					{ from: "e1", to: "e2" },
					{ from: "e1", to: "c1" }
				]
			)
		})
	})

	describe("check validation", () => {
		it("should not allow moves that leave king in check", () => {
			// Black rook on e8 giving check, moving f2 can't help
			expectMoves("4r3/8/8/8/8/8/5P2/4K3 w - - 0 1", "f2", [])
		})

		it("should require moving out of check", () => {
			// Black rook on e8 giving check, only king can move
			expectMoves("4r3/8/8/8/8/8/5P2/4K3 w - - 0 1", "e1", [
				{ from: "e1", to: "d1" },
				{ from: "e1", to: "f1" },
				{ from: "e1", to: "d2" }
			])
		})
	})
})

describe("moveToAlgebraic", () => {
	it("should handle basic pawn moves", () => {
		expectAlgebraic(
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
			{ from: "e2", to: "e4" },
			"e4"
		)
		expectAlgebraic(
			"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
			{ from: "e7", to: "e5" },
			"e5"
		)
	})

	it("should handle pawn captures", () => {
		expectAlgebraic(
			"rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
			{ from: "e4", to: "d5" },
			"exd5"
		)
	})

	it("should handle en passant captures", () => {
		expectAlgebraic(
			"rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 1",
			{ from: "e5", to: "f6" },
			"exf6"
		)
	})

	it("should handle piece moves", () => {
		expectAlgebraic(
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
			{ from: "g1", to: "f3" },
			"Nf3"
		)
		expectAlgebraic(
			"rnbqkbnr/pppp1ppp/8/4p3/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 1",
			{ from: "f1", to: "b5" },
			"Bb5"
		)
	})

	it("should handle piece captures", () => {
		expectAlgebraic(
			"rnbqkbnr/pppp1ppp/8/4p3/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 1",
			{ from: "f3", to: "e5" },
			"Nxe5"
		)
	})

	it("should handle castling", () => {
		expectAlgebraic(
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w KQkq - 0 1",
			{ from: "e1", to: "g1" },
			"O-O"
		)
		expectAlgebraic(
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1",
			{ from: "e1", to: "c1" },
			"O-O-O"
		)
	})

	it("should handle pawn promotion", () => {
		expectAlgebraic(
			"rnbqkb2/ppppppPP/8/8/8/8/PPPPPP2/RNBQKBNR w KQkq - 0 1",
			{ from: "g7", to: "g8", promotion: "q" },
			"g8=Q"
		)

		expectAlgebraic(
			"rnbqkb2/ppppppPP/8/8/8/8/PPPPPP2/RNBQKBNR w KQkq - 0 1",
			{ from: "g7", to: "h8", promotion: "n" },
			"gxh8=N"
		)
	})

	it("should handle disambiguation when necessary", () => {
		// Two knights can move to the same square
		expectAlgebraic(
			"k7/8/8/8/8/2N5/8/K5NR w - - 0 1",
			{ from: "c3", to: "e2" },
			"Nce2"
		)

		// Two rooks on same rank
		expectAlgebraic(
			"8/8/8/2k5/7R/8/5R2/K2B4 w - - 0 1",
			{ from: "f2", to: "f4" },
			"Rff4"
		)

		// Five queens
		expectAlgebraic(
			"k7/8/K7/8/1Q6/Q1Q5/3Q4/Q1Q5 w - - 0 1",
			{ from: "c3", to: "b2" },
			"Qc3b2"
		)
	})
})
