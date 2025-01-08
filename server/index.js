import Fastify from 'fastify'
import cors from '@fastify/cors'
import { createYoga } from 'graphql-yoga'
import mongoose from 'mongoose'
import { schema } from './schema.js'

const fastify = Fastify({
  logger: true
})

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/moneygraph')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

// Setup CORS
await fastify.register(cors, {
  origin: true
})

// Create Yoga instance
const yoga = createYoga({ schema })

// Register GraphQL endpoint
fastify.route({
  url: '/graphql',
  method: ['GET', 'POST', 'OPTIONS'],
  handler: async (req, reply) => {
    const response = await yoga.handleNodeRequest(req, {
      req,
      reply
    })
    
    response.headers.forEach((value, key) => {
      reply.header(key, value)
    })

    reply.status(response.status)
    reply.send(response.body)
  }
})

// Start server
try {
  await fastify.listen({ port: 4000 })
  console.log('Server running at http://localhost:4000/graphql')
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
