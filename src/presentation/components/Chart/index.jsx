import { useRef, useEffect } from 'preact/hooks'
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

// Register ChartJS components
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

export function Chart({ type = 'line', data, options, width = '100%', height = '100%' }) {
  const chartRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    // Cleanup previous chart instance
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    // Create new chart instance
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      chartRef.current = new ChartJS(ctx, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...options
        }
      })
    }

    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [data, options, type])

  return <canvas ref={canvasRef} style={{ width, height }} />
}
