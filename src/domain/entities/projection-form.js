export const makeProjectionForm = ({
  title = '',
  value = 0,
  cron = "0 0 1 * *",
  cronParser
}) => {
  const validate = () => {
    const errors = {}

    if (!title.trim()) {
      errors.title = 'Title is required'
    }

    if (typeof value !== 'number' || isNaN(value)) {
      errors.value = 'Value must be a number'
    }

    if (!cronParser.validate(cron)) {
      errors.cron = 'Invalid cron expression'
    }

    return errors
  }

  const isValid = () => {
    return Object.keys(validate()).length === 0
  }

  const toProjection = () => {
    if (!isValid()) {
      throw new Error('Cannot create projection from invalid form')
    }

    return {
      title,
      value,
      cron
    }
  }

  return Object.freeze({
    getTitle: () => title,
    getValue: () => value,
    getCron: () => cron,
    getCronExplanation: () => cronParser.explain(cron),
    validate,
    isValid,
    toProjection,
    withTitle: (newTitle) => makeProjectionForm({ title: newTitle, value, cron, cronParser }),
    withValue: (newValue) => makeProjectionForm({ title, value: newValue, cron, cronParser }),
    withCron: (newCron) => makeProjectionForm({ title, value, cron: newCron, cronParser })
  })
}
