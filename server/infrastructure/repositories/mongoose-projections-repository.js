import { makeProjection, makeProjectionList } from '../../domain/entities/projection.js'

export const makeMongooseProjectionsRepository = ({ ProjectionModel }) => {
  const modelToEntity = (model) => {
    if (!model) return null
    return makeProjection({
      id: model._id.toString(),
      title: model.title,
      value: model.value,
      cron: model.cron,
      createdAt: model.createdAt
    })
  }

  const add = async (projectionData) => {
    const projection = makeProjection(projectionData)
    const model = new ProjectionModel(projection.serialize())
    const saved = await model.save()
    return modelToEntity(saved)
  }

  const remove = async (id) => {
    await ProjectionModel.findByIdAndDelete(id)
    return true
  }

  const getAll = async () => {
    const models = await ProjectionModel.find().sort({ createdAt: 1 })
    const projections = models.map(modelToEntity)
    return makeProjectionList(projections)
  }

  const clear = async () => {
    await ProjectionModel.deleteMany({})
    return true
  }

  const importMany = async (projectionsData) => {
    const projections = projectionsData.map(data => makeProjection(data))
    const models = await ProjectionModel.insertMany(
      projections.map(p => p.serialize())
    )
    return models.map(modelToEntity)
  }

  return Object.freeze({
    add,
    remove,
    getAll,
    clear,
    importMany
  })
}
