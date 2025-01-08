import { createSchema } from 'graphql-yoga'
import { container } from '../src/infrastructure/di/container'

export const schema = createSchema({
  typeDefs: `
    type Projection {
      id: ID!
      title: String!
      value: Float!
      cron: String!
      createdAt: String
    }

    input ProjectionInput {
      title: String!
      value: Float!
      cron: String!
      createdAt: String
    }

    type Query {
      projections: [Projection!]!
      projection(id: ID!): Projection
    }

    type Mutation {
      addProjection(title: String!, value: Float!, cron: String!, createdAt: String): Projection!
      deleteProjection(id: ID!): Boolean!
      clearProjections: Boolean!
      importProjections(projections: [ProjectionInput!]!): [Projection!]!
    }
  `,
  
  resolvers: {
    Query: {
      projections: async () => {
        const projectionList = await container.projectionUseCases.getAllProjections()
        return projectionList.serialize()
      },
      projection: async (_, { id }) => {
        const projectionList = await container.projectionUseCases.getAllProjections()
        const projection = projectionList.find(id)
        return projection?.serialize()
      },
    },
    
    Mutation: {
      addProjection: async (_, projectionData) => {
        const projection = await container.projectionUseCases.addProjection(projectionData)
        return projection.serialize()
      },
      
      deleteProjection: async (_, { id }) => {
        return await container.projectionUseCases.removeProjection(id)
      },
      
      clearProjections: async () => {
        return await container.projectionUseCases.clearProjections()
      },
      
      importProjections: async (_, { projections }) => {
        const imported = await container.projectionUseCases.importProjections(projections)
        return imported.map(p => p.serialize())
      },
    },
  }
})
