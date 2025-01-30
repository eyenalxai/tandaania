import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		testTimeout: 30_000
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src")
		}
	}
})
