import { defineConfig, loadEnv } from "vite"
import preact from "@preact/preset-vite"

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "")

	return {
		plugins: [preact()],
		server: {
			port: parseInt(env.VITE_PORT) || 3100,
			strictPort: true,
			proxy: {
				"/graphql": {
					target: `http://localhost:${env.VITE_GQL_PORT || 4000}`,
					changeOrigin: true,
					secure: false,
				},
			},
		},
		esbuild: {
			logOverride: { "this-is-undefined-in-esm": "silent" },
		},
	}
})
