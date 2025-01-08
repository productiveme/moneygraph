import Fastify from "fastify"
import cors from "@fastify/cors"
import { createYoga } from "graphql-yoga"
import mongoose from "mongoose"
import { schema } from "./schema.js"

const fastify = Fastify({
	logger: true,
})

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/moneygraph"

// Connect to MongoDB
await mongoose
	.connect(MONGODB_URI)
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("MongoDB connection error:", err))

// Setup CORS
await fastify.register(cors, {
	origin: true,
})

// Create Yoga instance
const yoga = createYoga({ schema })

// Register GraphQL endpoint
fastify.route({
	url: "/graphql",
	method: ["GET", "POST", "OPTIONS"],
	handler: async (req, reply) => {
		const response = await yoga.handleNodeRequest(req, {
			req,
			reply,
		})

		response.headers.forEach((value, key) => {
			reply.header(key, value)
		})

		reply.status(response.status)
		reply.send(response.body)
	},
})

// Start server
try {
	const port = process.env.VITE_GQL_PORT || 4000
	await fastify.listen({ port })
	console.log(`Server running at http://localhost:${port}/graphql`)
} catch (err) {
	fastify.log.error(err)
	process.exit(1)
}
