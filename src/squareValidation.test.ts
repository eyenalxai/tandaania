import { isSquare } from "@/state"
import { describe, expect, test } from "vitest"

describe("isSquare", () => {
	test("should validate correct square notations", () => {
		const validSquares = ["a1", "e4", "h8", "b6", "g2"]
		for (const square of validSquares) {
			expect(isSquare(square)).toBe(true)
		}
	})

	test("should reject invalid square notations", () => {
		const invalidSquares = [
			"a0",
			"e9",
			"i4",
			"aa",
			"11",
			"a",
			"4",
			"",
			"a1b",
			"  "
		]
		for (const square of invalidSquares) {
			expect(isSquare(square)).toBe(false)
		}
	})
})
