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

	test("should validate squares for larger boards", () => {
		// 10x10 board
		const validSquares10x10 = ["i1", "j10", "a9", "e10"]
		for (const square of validSquares10x10) {
			expect(isSquare(square, 10)).toBe(true)
		}
		expect(isSquare("k1", 10)).toBe(false)
		expect(isSquare("a11", 10)).toBe(false)

		// 16x16 board
		const validSquares16x16 = ["p1", "o16", "i12", "m15"]
		for (const square of validSquares16x16) {
			expect(isSquare(square, 16)).toBe(true)
		}
		expect(isSquare("q1", 16)).toBe(false)
		expect(isSquare("a17", 16)).toBe(false)
	})

	test("should handle invalid board sizes", () => {
		expect(isSquare("a1", 7)).toBe(false) // Too small board
		expect(isSquare("a1", 17)).toBe(false) // Too large board
	})
})
