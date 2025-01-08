import { useEffect } from 'preact/hooks'
import useProjectionsStore from '../../store/projections'
import { makeProjectionCalculator } from '../../../domain/services/projection-calculator'

export function Settings() {
  const {
    startValue,
    endGoal,
    projections,
    setStartValue,
    setEndGoal,
    fetchProjections
  } = useProjectionsStore()

  const calculator = makeProjectionCalculator()

  useEffect(() => {
    fetchProjections()
  }, [])

  const calculateProjectedTotal = () => {
    if (!projections.length) return 0

    const now = new Date()
    const threeMonthsFromNow = new Date(now.setMonth(now.getMonth() + 3))
    
    const projectionsWithDates = calculator.calculateProjectionsWithDates(
      projections,
      now,
      threeMonthsFromNow
    )

    const timeValueSeries = calculator.calculateTimeValueSeries(
      projectionsWithDates,
      now,
      startValue
    )

    const groupedByDate = calculator.groupByDate(timeValueSeries)
    const appliedValues = calculator.calculateCumulativeValues(groupedByDate)

    return appliedValues[appliedValues.length - 1]?.y || 0
  }

  const projectedTotal = calculateProjectedTotal()

  return (
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <h2 class="text-2xl font-bold mb-6">Settings</h2>
      
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Default Start Value
          </label>
          <input
            type="number"
            class="input w-full max-w-xs"
            value={startValue}
            onChange={(e) => setStartValue(Number(e.target.value))}
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Default Goal Value
          </label>
          <input
            type="number"
            class="input w-full max-w-xs"
            value={endGoal}
            onChange={(e) => setEndGoal(Number(e.target.value))}
          />
        </div>

        <div class="pt-4 border-t">
          <h3 class="text-lg font-semibold mb-2">Projections Summary</h3>
          <p class="text-gray-600">
            Projected total after 3 months: {projectedTotal.toFixed(2)}
          </p>
          <p class="text-gray-600">
            Goal difference: {(endGoal - projectedTotal).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}
