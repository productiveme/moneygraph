import { Projection } from './models/Projection.js'

export const resolvers = {
  Query: {
    projections: async () => {
      return await Projection.find().sort({ createdAt: 1 })
    },
    projection: async (_, { id }) => {
      return await Projection.findById(id)
    },
  },
  
  Mutation: {
    addProjection: async (_, { title, value, cron, createdAt }) => {
      const projection = new Projection({
        title,
        value,
        cron,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      })
      return await projection.save()
    },
    
    deleteProjection: async (_, { id }) => {
      await Projection.findByIdAndDelete(id)
      return true
    },
    
    clearProjections: async () => {
      await Projection.deleteMany({})
      return true
    },
    
    importProjections: async (_, { projections }) => {
      const result = await Projection.insertMany(
        projections.map(p => ({
          ...p,
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        }))
      )
      return result
    },
  },
}
