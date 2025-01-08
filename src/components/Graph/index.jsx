import { useState, useEffect } from 'react'
import { useQuery, gql } from '@apollo/client'
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
import styles from './Graph.module.scss'

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

const GET_PROJECTIONS = gql`
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

export const Graph = ({
  start = { date: new Date(), value: 0 },
  end = { date: dayjs().add(3, 'month').toDate(), goal: 0 }
}) => {
  const [startDate, setStartDate] = useState(start.date)
  const [startValue, setStartValue] = useState(start.value)
  const [endDate, setEndDate] = useState(end.date)
  const [endGoal, setEndGoal] = useState(end.goal)
  const [graphData, setGraphData] = useState({ labels: [], datasets: [] })

  const { loading, error, data } = useQuery(GET_PROJECTIONS)

  useEffect(() => {
    if (!data) return

    const projectionsWithDates = data.projections.map((projection) => {
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

    setGraphData({
      labels: appliedValues.map((v) => v.x),
      datasets: [
        {
          label: 'Projections',
          data: appliedValues.map((itm) => itm.y || 0),
        },
        {
          label: 'Goal',
          data: appliedValues.map(() => endGoal),
          pointStyle: false,
        },
      ],
    })
  }, [data, startDate, startValue, endDate, endGoal])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <>
      <div style={{ width: '99%' }}>
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
      <div className={styles.graphControls}>
        <button onClick={() => setEndDate(dayjs(endDate).subtract(1, 'month').toDate())}>
          -
        </button>
        <div></div>
        <span>
          Start Value:{' '}
          <input
            type="number"
            name="startValue"
            value={startValue}
            onChange={(e) => setStartValue(Number(e.target.value))}
            placeholder="Start Value"
          />
        </span>
        <span>
          Goal:{' '}
          <input
            type="number"
            name="goal"
            value={endGoal}
            onChange={(e) => setEndGoal(Number(e.target.value))}
            placeholder="Goal"
          />
        </span>
        <div></div>
        <button onClick={() => setEndDate(dayjs(endDate).add(1, 'month').toDate())}>
          +
        </button>
      </div>
    </>
  )
}
