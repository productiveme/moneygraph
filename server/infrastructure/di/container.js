import { makeProjectionUseCases } from '../domain/use-cases/projection-use-cases.js'
import { makeMongooseProjectionsRepository } from '../repositories/mongoose-projections-repository.js'
import { Projection } from '../db/models/Projection.js'

export const makeContainer = () => {
  // Repositories
  const projectionsRepository = makeMongooseProjectionsRepository({
    ProjectionModel: Projection
  })

  // Use cases
  const projectionUseCases = makeProjectionUseCases({
    projectionsRepository
  })

  return Object.freeze({
    projectionsRepository,
    projectionUseCases
  })
}

export const container = makeContainer()
