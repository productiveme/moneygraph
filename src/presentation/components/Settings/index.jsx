import { useEffect } from 'preact/hooks'
import useProjectionsStore from '../../store/projections'
import { Chart } from '../Chart'
import dayjs from 'dayjs'

export function Settings() {
  const {
    startValue,
    endGoal,
    projections,
    setStartValue,
    setEndGoal,
    fetchProjections
  } = useProjectionsStore()

  useEffect(() => {
    fetchProjections()
  }, [])

  const calculateProjectedData = () => {
    if (!projections.length) return { total: 0, monthlyData: [] }

    const now = new Date()
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now)
      date.setMonth(date.getMonth() + i)
      return date
    })

    const monthlyTotals = months.map((date, index) => {
      const total = projections.reduce((sum, projection) => {
        const monthlyOccurrences = projection
          .getCron()
          .split(' ')
          .filter(val => val !== '*').length

        return sum + (projection.getValue() * (12 / monthlyOccurrences))
      }, 0)

      return {
        x: date,
        y: startValue + (total * (index + 1) / 12)
      }
    })

    return {
      total: monthlyTotals[monthlyTotals.length - 1]?.y || 0,
      monthlyData: monthlyTotals
    }
  }

  const { total, monthlyData } = calculateProjectedData()
  const projectedData = {
    labels: monthlyData.map(d => d.x),
    datasets: [
      {
        label: 'Projected Growth',
        data: monthlyData.map(d => d.y),
        borderColor: '#10B981',
        tension: 0.1
      },
      {
        label: 'Goal',
        data: monthlyData.map(() => endGoal),
        borderColor: '#6366F1',
        borderDash: [5, 5],
        pointStyle: false
      }
    ]
  }

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
          <h3 class="text-lg font-semibold mb-2">Annual Projection</h3>
          <div class="h-[300px] mb-4">
            <Chart
              type="line"
              data={projectedData}
              options={{
                scales: {
                  x: {
                    type: 'time',
                    time: {
                      unit: 'month',
                    },
                  },
                },
              }}
            />
          </div>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div class="bg-green-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Projected Annual Total</p>
              <p class="text-2xl font-bold text-green-700">{total.toFixed(2)}</p>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Goal Difference</p>
              <p class="text-2xl font-bold text-blue-700">
                {(endGoal - total).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
