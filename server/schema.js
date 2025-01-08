export const typeDefs = `#graphql
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
`
