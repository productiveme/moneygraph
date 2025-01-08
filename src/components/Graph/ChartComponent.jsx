import { useEffect, useRef } from "preact/hooks"
import {
	Chart,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	TimeScale,
} from "chart.js"
import "chartjs-adapter-dayjs-4"

Chart.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	TimeScale
)

export function ChartComponent({ data, options }) {
	const chartRef = useRef(null)
	const canvasRef = useRef(null)

	useEffect(() => {
		if (chartRef.current) {
			chartRef.current.destroy()
		}

		if (canvasRef.current) {
			const ctx = canvasRef.current.getContext("2d")
			chartRef.current = new Chart(ctx, {
				type: "line",
				data,
				options: {
					responsive: true,
					maintainAspectRatio: false,
					scales: {
						x: {
							type: "time",
							time: {
								unit: "week",
							},
						},
					},
					...options,
				},
			})
		}

		return () => {
			if (chartRef.current) {
				chartRef.current.destroy()
			}
		}
	}, [data, options])

	return <canvas ref={canvasRef} />
}
