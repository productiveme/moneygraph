import { parseCronExpression } from 'cron-schedule'
import dayjs from 'dayjs'

export const makeProjectionCalculator = () => {
  const calculateProjectionsWithDates = (projections, startDate, endDate) => {
    return projections.map((projection) => {
      const cron = parseCronExpression(projection.getCron())
      let dates = [cron.getNextDate(startDate)]
      
      while (dates[dates.length - 1] < endDate) {
        dates.push(cron.getNextDate(dates[dates.length - 1]))
      }
      
      if (dates[dates.length - 1] > endDate) {
        dates.pop()
      }
      
      return {
        title: projection.getTitle(),
        value: projection.getValue(),
        dates,
      }
    })
  }

  const calculateTimeValueSeries = (projectionsWithDates, startDate, startValue) => {
    const series = [{ x: startDate, y: startValue, title: 'Start' }]
    
    projectionsWithDates.forEach((projection) => {
      projection.dates.forEach((date) => {
        series.push({
          x: date,
          y: projection.value,
          title: projection.title
        })
      })
    })

    return series
  }

  const groupByDate = (timeValueSeries) => {
    return timeValueSeries.reduce((obj, item) => {
      if (!obj[item.x]) {
        obj[item.x] = {}
      }
      obj[item.x] = {
        y: Number(item.y + (obj[item.x]?.y || 0)),
        title: [item.title, obj[item.x]?.title].filter((x) => !!x).join(', '),
      }
      return obj
    }, {})
  }

  const calculateCumulativeValues = (groupedByDate) => {
    return Object.entries(groupedByDate)
      .sort((a, b) => dayjs(a[0]).toDate() - dayjs(b[0]).toDate())
      .reduce((arr, [x, itm]) => {
        if (arr.length && arr[arr.length - 1]) {
          return [...arr, { ...itm, y: arr[arr.length - 1].y + itm.y, x }]
        } else {
          return [...arr, { ...itm, x }]
        }
      }, [])
  }

  return Object.freeze({
    calculateProjectionsWithDates,
    calculateTimeValueSeries,
    groupByDate,
    calculateCumulativeValues
  })
}
