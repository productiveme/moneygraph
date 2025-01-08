export const makeProjection = ({
  id = null,
  title,
  value,
  cron,
  createdAt = new Date()
} = {}) => {
  if (!title) throw new Error('Projection must have a title')
  if (typeof value !== 'number') throw new Error('Value must be a number')
  if (!cron) throw new Error('Projection must have a cron expression')

  return Object.freeze({
    getId: () => id,
    getTitle: () => title,
    getValue: () => value,
    getCron: () => cron,
    getCreatedAt: () => createdAt,
    serialize: () => ({
      id,
      title,
      value,
      cron,
      createdAt: createdAt.toISOString()
    }),
    withId: (newId) => makeProjection({ id: newId, title, value, cron, createdAt }),
    withValue: (newValue) => makeProjection({ id, title, value: newValue, cron, createdAt })
  })
}

export const makeProjectionList = (projections = []) => {
  const items = [...projections]

  return Object.freeze({
    getAll: () => [...items],
    add: (projection) => makeProjectionList([...items, projection]),
    remove: (id) => makeProjectionList(items.filter(p => p.getId() !== id)),
    clear: () => makeProjectionList([]),
    find: (id) => items.find(p => p.getId() === id),
    serialize: () => items.map(p => p.serialize())
  })
}
