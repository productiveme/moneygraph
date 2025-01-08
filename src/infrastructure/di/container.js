import { makeProjectionUseCases } from '../../domain/use-cases/projection-use-cases'
import { makeMongooseProjectionsRepository } from '../repositories/mongoose-projections-repository'
import { Projection as ProjectionModel } from '../db/models/Projection'

export const makeContainer = () => {
  // Repositories
  const projectionsRepository = makeMongooseProjectionsRepository({
    ProjectionModel
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
