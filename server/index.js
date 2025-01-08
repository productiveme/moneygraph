import express from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import cors from 'cors'
import mongoose from 'mongoose'
import { typeDefs } from './schema.js'
import { resolvers } from './resolvers.js'

const app = express()
const PORT = 4000

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/moneygraph')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

await server.start()

app.use(cors())
app.use(express.json())
app.use('/graphql', expressMiddleware(server))

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/graphql`)
})
