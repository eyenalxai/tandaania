import { perft } from "@/perft"
import { DEFAULT_FEN, parseFen } from "@/state"
import { describe, expect, it } from "vitest"

describe("perft", () => {
	it("should calculate correct perft values for Position 1", () => {
		const state = parseFen(DEFAULT_FEN)

		const results = [
			{
				depth: 0,
				expected: {
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
			},
			{
				depth: 1,
				expected: {
					nodes: 20,
					captures: 0,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 0,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 2,
				expected: {
					nodes: 400,
					captures: 0,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 0,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 3,
				expected: {
					nodes: 8902,
					captures: 34,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 12,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 4,
				expected: {
					nodes: 197281,
					captures: 1576,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 469,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 8
				}
			}
		]

		for (const { depth, expected } of results) {
			const result = perft(state, depth)
			expect(result).toEqual(expected)
		}
	})

	it("should calculate correct perft values for Position 2", () => {
		const kiwipeteFen =
			"r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
		const state = parseFen(kiwipeteFen)

		const results = [
			{
				depth: 0,
				expected: {
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
			},
			{
				depth: 1,
				expected: {
					nodes: 48,
					captures: 8,
					enPassant: 0,
					castles: 2,
					promotions: 0,
					checks: 0,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 2,
				expected: {
					nodes: 2039,
					captures: 351,
					enPassant: 1,
					castles: 91,
					promotions: 0,
					checks: 3,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 3,
				expected: {
					nodes: 97862,
					captures: 17102,
					enPassant: 45,
					castles: 3162,
					promotions: 0,
					checks: 993,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 1
				}
			}
		]

		for (const { depth, expected } of results) {
			const result = perft(state, depth)
			expect(result).toEqual(expected)
		}
	})

	it("should calculate correct perft values for Position 3", () => {
		const position3Fen = "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1"
		const state = parseFen(position3Fen)

		const results = [
			{
				depth: 1,
				expected: {
					nodes: 14,
					captures: 1,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 2,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 2,
				expected: {
					nodes: 191,
					captures: 14,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 10,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 3,
				expected: {
					nodes: 2812,
					captures: 209,
					enPassant: 2,
					castles: 0,
					promotions: 0,
					checks: 267,
					discoveryChecks: 3,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 4,
				expected: {
					nodes: 43238,
					captures: 3348,
					enPassant: 123,
					castles: 0,
					promotions: 0,
					checks: 1680,
					discoveryChecks: 106,
					doubleChecks: 0,
					checkmates: 17
				}
			}
		]

		for (const { depth, expected } of results) {
			const result = perft(state, depth)
			expect(result).toEqual(expected)
		}
	})

	it("should calculate correct perft values for Position 4", () => {
		const position4Fen =
			"r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1"
		const state = parseFen(position4Fen)

		const results = [
			{
				depth: 1,
				expected: {
					nodes: 6,
					captures: 0,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 0,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 2,
				expected: {
					nodes: 264,
					captures: 87,
					enPassant: 0,
					castles: 6,
					promotions: 48,
					checks: 10,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 3,
				expected: {
					nodes: 9467,
					captures: 1021,
					enPassant: 4,
					castles: 0,
					promotions: 120,
					checks: 38,
					discoveryChecks: 2,
					doubleChecks: 0,
					checkmates: 22
				}
			}
		]

		for (const { depth, expected } of results) {
			const result = perft(state, depth)
			expect(result).toEqual(expected)
		}
	})

	it("should calculate correct perft values for Position 5", () => {
		const position5Fen =
			"rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8"
		const state = parseFen(position5Fen)

		const results = [
			{
				depth: 1,
				expected: {
					nodes: 44,
					captures: 6,
					enPassant: 0,
					castles: 1,
					promotions: 4,
					checks: 0,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 2,
				expected: {
					nodes: 1486,
					captures: 222,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 117,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 3,
				expected: {
					nodes: 62379,
					captures: 8517,
					enPassant: 0,
					castles: 1081,
					promotions: 5068,
					checks: 1201,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 44
				}
			}
		]

		for (const { depth, expected } of results) {
			const result = perft(state, depth)
			expect(result).toEqual(expected)
		}
	})

	it("should calculate correct perft values for Position 6", () => {
		const position6Fen =
			"r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10"
		const state = parseFen(position6Fen)

		const results = [
			{
				depth: 0,
				expected: {
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
			},
			{
				depth: 1,
				expected: {
					nodes: 46,
					captures: 4,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 1,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 2,
				expected: {
					nodes: 2079,
					captures: 203,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 40,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 3,
				expected: {
					nodes: 89890,
					captures: 9470,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 1783,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			}
		]

		for (const { depth, expected } of results) {
			const result = perft(state, depth)
			expect(result).toEqual(expected)
		}
	})
})
