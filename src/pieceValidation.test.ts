import { charToPiece, isPiece } from "@/state"
import { describe, expect, test } from "vitest"

describe("isPiece", () => {
	test("should validate correct piece characters", () => {
		const validPieces = [
			"p",
			"n",
			"b",
			"r",
			"q",
			"k",
			"P",
			"N",
			"B",
			"R",
			"Q",
			"K"
		]
		for (const piece of validPieces) {
			expect(isPiece(piece)).toBe(true)
		}
	})

	test("should reject invalid piece characters", () => {
		const invalidPieces = ["x", "1", "", " ", "pP", "kk", "qq", "$"]
		for (const piece of invalidPieces) {
			expect(isPiece(piece)).toBe(false)
		}
	})
})

describe("charToPiece", () => {
	test("should convert valid piece characters", () => {
		const conversions = [
			["p", "bp"],
			["n", "bn"],
			["b", "bb"],
			["r", "br"],
			["q", "bq"],
			["k", "bk"],
			["P", "wp"],
			["N", "wn"],
			["B", "wb"],
			["R", "wr"],
			["Q", "wq"],
			["K", "wk"]
		]

		for (const [input, expected] of conversions) {
			expect(charToPiece(input)).toBe(expected)
		}
	})

	test("should throw error for invalid piece characters", () => {
		const invalidChars = ["x", "1", "", " ", "pP", "kk", "qq", "$"]
		for (const char of invalidChars) {
			expect(() => charToPiece(char)).toThrow("Invalid piece character")
		}
	})
})
