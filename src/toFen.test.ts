import { DEFAULT_FEN, parseFen, toFen } from "@/state"
import { describe, expect, test } from "vitest"

describe("toFen", () => {
	test("should convert initial position correctly", () => {
		const state = parseFen(DEFAULT_FEN)
		expect(toFen(state)).toBe(DEFAULT_FEN)
	})

	test("should convert mid-game position correctly", () => {
		const midGameFen =
			"rnbqkb1r/pp2pppp/2p2n2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R w KQkq - 0 5"
		const state = parseFen(midGameFen)
		expect(toFen(state)).toBe(midGameFen)
	})

	test("should handle empty squares correctly", () => {
		const emptyBoardFen = "8/8/8/8/8/8/8/8 w - - 0 1"
		const state = parseFen(emptyBoardFen)
		expect(toFen(state)).toBe(emptyBoardFen)
	})

	test("should handle en passant target", () => {
		const enPassantFen =
			"rnbqkbnr/ppp2ppp/8/3p4/3Pp3/8/PPP2PPP/RNBQKBNR w KQkq e3 0 3"
		const state = parseFen(enPassantFen)
		expect(toFen(state)).toBe(enPassantFen)
	})

	test("should handle different castling rights", () => {
		const testCases = [
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1",
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w K - 0 1",
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Q - 0 1",
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w k - 0 1",
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w q - 0 1",
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Kk - 0 1",
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Qq - 0 1"
		]

		for (const fen of testCases) {
			const state = parseFen(fen)
			expect(toFen(state)).toBe(fen)
		}
	})

	test("should handle complex positions", () => {
		const complexFen =
			"r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
		const state = parseFen(complexFen)
		expect(toFen(state)).toBe(complexFen)
	})

	test("should round-trip all test positions", () => {
		const testPositions = [
			DEFAULT_FEN,
			"rnbqkb1r/pp2pppp/2p2n2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R w KQkq - 0 5",
			"8/8/8/8/8/8/8/8 w - - 0 1",
			"rnbqkbnr/ppp2ppp/8/3p4/3Pp3/8/PPP2PPP/RNBQKBNR w KQkq e3 0 3",
			"r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
		]

		for (const fen of testPositions) {
			expect(toFen(parseFen(fen))).toBe(fen)
		}
	})
})
