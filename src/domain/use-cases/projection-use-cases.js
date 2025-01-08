export const makeProjectionUseCases = ({ projectionsRepository }) => {
  const addProjection = async (projectionData) => {
    return await projectionsRepository.add(projectionData)
  }

  const removeProjection = async (id) => {
    return await projectionsRepository.remove(id)
  }

  const getAllProjections = async () => {
    return await projectionsRepository.getAll()
  }

  const clearProjections = async () => {
    return await projectionsRepository.clear()
  }

  const importProjections = async (projections) => {
    return await projectionsRepository.importMany(projections)
  }

  return Object.freeze({
    addProjection,
    removeProjection,
    getAllProjections,
    clearProjections,
    importProjections
  })
}
