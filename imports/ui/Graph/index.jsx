import { createEffect, createSignal, onMount, Show } from "solid-js"
import { Tracker } from "meteor/tracker"
import { Meteor } from "meteor/meteor"
import dayjs from "dayjs"
import { parseCronExpression } from "cron-schedule"
import { Chart, Title, Tooltip, Legend, Colors, TimeScale } from "chart.js"
import { Line } from "solid-chartjs"
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm"
import { Projections } from "../../api/projections"
import styles from "./style.module.scss"

export const Graph = ({
	start = { date: new Date(), value: 0 },
	end = { date: dayjs().add(3, "month").toDate(), goal: 0 },
}) => {
	const subscription = Meteor.subscribe("projections")
	const [isReady, setIsReady] = createSignal(subscription.ready())
	const [projections, setProjections] = createSignal([])
	const [graphData, setGraphData] = createSignal([])
	const [startDate, setStartDate] = createSignal(start.date)
	const [startValue, setStartValue] = createSignal(start.value)
	const [endDate, setEndDate] = createSignal(end.date)
	const [endGoal, setEndGoal] = createSignal(end.goal)

	onMount(() => {
		Chart.register(Title, Tooltip, Legend, Colors, TimeScale)
	})

	Tracker.autorun(async () => {
		setIsReady(subscription.ready())
		const projections = await Projections.find().fetchAsync()
		setProjections(projections)
	})

	createEffect(() => {
		const projectionsWithDates = projections().map((projection) => {
			const cron = parseCronExpression(projection.cron)
			let dates = [cron.getNextDate(startDate())]
			while (dates[dates.length - 1] < endDate()) {
				dates.push(cron.getNextDate(dates[dates.length - 1]))
			}
			if (dates[dates.length - 1] > endDate()) {
				dates.pop()
			}
			return {
				title: projection.title,
				value: projection.value,
				dates,
			}
		})
		const timeValueSeries = [{ x: startDate(), y: startValue(), title: "Start" }]
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
				title: [item.title, obj[item.x]?.title].filter((x) => !!x).join(", "),
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

		const chartData = {
			labels: appliedValues.map((v) => v.x),
			datasets: [
				{
					label: "Projections",
					data: appliedValues.map((itm) => itm.y || 0),
				},
				{
					label: "Goal",
					data: appliedValues.map((itm) => endGoal()),
					pointStyle: false,
				},
			],
		}

		setGraphData(chartData)
	})

	return (
		<Show when={isReady()} fallback={<div>Loading...</div>}>
			<div style={{ width: "99%" }}>
				<Line
					data={graphData()}
					options={{
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
					}}
				/>
			</div>
			<div class={styles.graphControls}>
				<button onClick={() => setEndDate(dayjs(endDate()).subtract(1, "month").toDate())}>
					-
				</button>
				<div></div>
				<span>
					Start Value:{" "}
					<input
						type="number"
						name="startValue"
						value={startValue()}
						onInput={(e) => setStartValue(Number(e.target.value))}
						placeholder="Start Value"
					/>
				</span>
				<span>
					Goal:{" "}
					<input
						type="number"
						name="goal"
						value={endGoal()}
						onInput={(e) => setEndGoal(Number(e.target.value))}
						placeholder="Goal"
					/>
				</span>
				<div></div>
				<button onClick={() => setEndDate(dayjs(endDate()).add(1, "month").toDate())}>
					+
				</button>
			</div>
		</Show>
	)
}
