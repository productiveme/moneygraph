export const makeYamlImport = ({ content, reverseSign = true, defaultCron }) => {
  if (!content) throw new Error('YAML content is required')
  if (!defaultCron) throw new Error('Default cron expression is required')

  const getNumberKeyValues = (obj, parentCron = defaultCron) => {
    const result = []
    
    const pushItem = (key, value, cron) => {
      const adjustedValue = reverseSign ? value * -1 : value
      result.push({ title: key, value: adjustedValue, cron })
    }

    const recursiveWalk = (obj, parentKey = "", currentCron = parentCron) => {
      if (typeof obj !== 'object' || obj === null) return

      Object.entries(obj).forEach(([key, value]) => {
        if (key.startsWith("_")) {
          if (key === "_cron") currentCron = value
          return
        }

        if (value === 0) return

        const currentKey = parentKey ? `${parentKey}/${key}` : key

        if (typeof value === "number") {
          pushItem(currentKey, value, currentCron)
        } else if (typeof value === "object") {
          recursiveWalk(value, currentKey, currentCron)
        }
      })
    }

    recursiveWalk(obj)
    return result
  }

  return Object.freeze({
    getNumberKeyValues,
    getReverseSign: () => reverseSign,
    getDefaultCron: () => defaultCron
  })
}
