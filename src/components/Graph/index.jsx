import { useEffect } from 'preact/hooks'
import { useQuery } from 'urql'
import dayjs from 'dayjs'
import { parseCronExpression } from 'cron-schedule'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js'
import 'chartjs-adapter-dayjs-4'
import useProjectionsStore from '../../store/projections'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

const GET_PROJECTIONS = `
  query GetProjections {
    projections {
      id
      title
      value
      cron
      createdAt
    }
  }
`

export function Graph() {
  const {
    startDate,
    startValue,
    endDate,
    endGoal,
    setEndDate,
    setStartValue,
    setEndGoal
  } = useProjectionsStore()

  const [result] = useQuery({ query: GET_PROJECTIONS })
  const { data, fetching, error } = result

  const calculateGraphData = (projections) => {
    if (!projections) return { labels: [], datasets: [] }

    const projectionsWithDates = projections.map((projection) => {
      const cron = parseCronExpression(projection.cron)
      let dates = [cron.getNextDate(startDate)]
      while (dates[dates.length - 1] < endDate) {
        dates.push(cron.getNextDate(dates[dates.length - 1]))
      }
      if (dates[dates.length - 1] > endDate) {
        dates.pop()
      }
      return {
        title: projection.title,
        value: projection.value,
        dates,
      }
    })

    const timeValueSeries = [{ x: startDate, y: startValue, title: 'Start' }]
    projectionsWithDates.forEach((projection) => {
      projection.dates.forEach((date) => {
        timeValueSeries.push({ x: date, y: projection.value, title: projection.title })
      })
    })

    const groupedByDate = timeValueSeries.reduce((obj, item) => {
      if (!obj[item.x]) {
        obj[item.x] = {}
      }
      obj[item.x] = {
        y: Number(item.y + (obj[item.x]?.y || 0)),
        title: [item.title, obj[item.x]?.title].filter((x) => !!x).join(', '),
      }
      return obj
    }, {})

    const appliedValues = Object.entries(groupedByDate)
      .sort((a, b) => dayjs(a[0]).toDate() - dayjs(b[0]).toDate())
      .reduce((arr, [x, itm]) => {
        if (arr.length && arr[arr.length - 1]) {
          return [...arr, { ...itm, y: arr[arr.length - 1].y + itm.y, x }]
        } else {
          return [...arr, { ...itm, x }]
        }
      }, [])

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

  if (fetching) return <div class="text-center py-4">Loading...</div>
  if (error) return <div class="text-red-500 py-4">Error: {error.message}</div>

  const graphData = calculateGraphData(data?.projections)

  return (
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <div class="h-[400px]">
        <Line
          data={graphData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                type: 'time',
                time: {
                  unit: 'week',
                },
              },
            },
          }}
        />
      </div>
      <div class="grid grid-cols-6 gap-4 mt-6">
        <button
          onClick={() => setEndDate(dayjs(endDate).subtract(1, 'month').toDate())}
          class="btn btn-primary"
        >
          -
        </button>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700">Start Value</label>
          <input
            type="number"
            class="input w-full mt-1"
            value={startValue}
            onInput={(e) => setStartValue(Number(e.target.value))}
          />
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700">Goal</label>
          <input
            type="number"
            class="input w-full mt-1"
            value={endGoal}
            onInput={(e) => setEndGoal(Number(e.target.value))}
          />
        </div>
        <button
          onClick={() => setEndDate(dayjs(endDate).add(1, 'month').toDate())}
          class="btn btn-primary"
        >
          +
        </button>
      </div>
    </div>
  )
}
