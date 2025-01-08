import { useEffect } from 'preact/hooks'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, /* ... other imports */ } from 'chart.js'
import 'chartjs-adapter-dayjs-4'
import useProjectionsStore from '../../store/projections'
import { makeProjectionCalculator } from '../../../domain/services/projection-calculator'

ChartJS.register(/* ... register components */)

export function Graph() {
  const {
    startDate,
    startValue,
    endDate,
    endGoal,
    projections,
    loading,
    error,
    setEndDate,
    setStartValue,
    setEndGoal,
    fetchProjections
  } = useProjectionsStore()

  const calculator = makeProjectionCalculator()

  useEffect(() => {
    fetchProjections()
  }, [])

  const calculateGraphData = () => {
    if (!projections.length) return { labels: [], datasets: [] }

    const projectionsWithDates = calculator.calculateProjectionsWithDates(
      projections,
      startDate,
      endDate
    )

    const timeValueSeries = calculator.calculateTimeValueSeries(
      projectionsWithDates,
      startDate,
      startValue
    )

    const groupedByDate = calculator.groupByDate(timeValueSeries)
    const appliedValues = calculator.calculateCumulativeValues(groupedByDate)

    return {
      labels: appliedValues.map((v) => v.x),
      datasets: [
        {
          label: 'Projections',
          data: appliedValues.map((itm) => itm.y || 0),
          borderColor: '#10B981',
          tension: 0.1
        },
        {
          label: 'Goal',
          data: appliedValues.map(() => endGoal),
          borderColor: '#6366F1',
          borderDash: [5, 5],
          pointStyle: false
        },
      ],
    }
  }

  if (loading) return <div class="text-center py-4">Loading...</div>
  if (error) return <div class="text-red-500 py-4">Error: {error}</div>

  const graphData = calculateGraphData()

  return (
    // ... rest of the component remains similar
  )
}
