import { evaluate } from "@/eval"
import { parseFen } from "@/state"
import { describe, expect, test } from "vitest"

describe("evaluate", () => {
	test("should evaluate starting position as equal", () => {
		const state = parseFen(
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
		)
		const score = evaluate(state)
		expect(score).toBe(0)
	})

	test("should evaluate position with extra white pawn as positive", () => {
		// Position where white has an extra pawn and slightly better position
		const state = parseFen(
			"rnbqkbnr/ppp1pppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
		)
		const score = evaluate(state)
		// The score should be at least 70 (considering potential negative positional factors)
		expect(score).toBeGreaterThan(70)
	})

	test("should evaluate position with extra black queen as very negative", () => {
		const state = parseFen(
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR w KQkq - 0 1"
		)
		const score = evaluate(state)
		expect(score).toBeLessThan(-800) // At least queen value
	})

	test("should evaluate endgame positions differently", () => {
		// Endgame position with kings and pawns
		const endgameState = parseFen("4k3/8/8/8/8/8/P7/4K3 w - - 0 1")
		const endgameScore = evaluate(endgameState)

		// Similar position in opening
		const openingState = parseFen("rnbqkbnr/pppppppp/8/8/8/8/P7/4K3 w - - 0 1")
		const openingScore = evaluate(openingState)

		// King position should be evaluated differently
		expect(Math.abs(endgameScore - openingScore)).toBeGreaterThan(0)
	})

	test("should evaluate piece mobility", () => {
		// Position where white pieces have more mobility
		const state = parseFen(
			"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1"
		)
		const score = evaluate(state)

		// Position with blocked center
		const blockedState = parseFen(
			"rnbqkbnr/pppppppp/8/8/4p3/4P3/PPPP1PPP/RNBQKBNR w KQkq - 0 1"
		)
		const blockedScore = evaluate(blockedState)

		// More mobile position should have a better score
		expect(score).toBeGreaterThan(blockedScore)
	})

	test("should evaluate 9x9 starting position as equal", () => {
		const state = parseFen(
			"rnbqkbnrr/ppppppppp/9/9/9/9/9/PPPPPPPPP/RNBQKBNRR w - - 0 1",
			9
		)
		const score = evaluate(state)
		expect(score).toBe(0)
	})

	test("should evaluate 10x10 starting position as equal", () => {
		const state = parseFen(
			"rnbqkbnrrr/pppppppppp/91/91/91/91/91/91/PPPPPPPPPP/RNBQKBNRRR w - - 0 1",
			10
		)
		const score = evaluate(state)
		expect(score).toBe(0)
	})

	test("should evaluate 11x11 starting position as equal", () => {
		const state = parseFen(
			"rnbqkbnrqqq/ppppppppqqq/92/92/92/92/92/92/92/PPPPPPPPQQQ/RNBQKBNRQQQ w - - 0 1",
			11
		)
		const score = evaluate(state)
		expect(score).toBe(0)
	})

	test("should evaluate 12x12 starting position as equal", () => {
		const state = parseFen(
			"rnbqkbnrqrbn/ppppppppnbrq/84/84/84/84/84/84/84/84/PPPPPPPPNBRQ/RNBQKBNRQRBN w - - 0 1",
			12
		)
		const score = evaluate(state)
		expect(score).toBe(0)
	})
})
