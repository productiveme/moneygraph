import cronstrue from 'cronstrue'

export const makeCronParser = () => {
  const DEFAULT_CRON = "0 0 1 * *"

  const validate = (cronExpression) => {
    try {
      cronstrue.toString(cronExpression || DEFAULT_CRON)
      return true
    } catch (error) {
      return false
    }
  }

  const explain = (cronExpression) => {
    try {
      return cronstrue.toString(cronExpression || DEFAULT_CRON)
        .replace("At 12:00 AM,", "")
    } catch (error) {
      return 'Invalid cron expression'
    }
  }

  const getDefault = () => DEFAULT_CRON

  return Object.freeze({
    validate,
    explain,
    getDefault
  })
}
