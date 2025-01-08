import { Meteor } from "meteor/meteor"
import { createSignal } from "solid-js"
import { Tracker } from "meteor/tracker"
import { Projections } from "../../api/projections"
import cronstrue from "cronstrue"
import styles from "./style.module.scss"
import { Importer } from "../Importer"

export const ProjectionsAdmin = () => {
	const DEFAULT_CRON = "0 0 1 * *"
	const subscription = Meteor.subscribe("projections")
	const [isReady, setIsReady] = createSignal(subscription.ready())
	const [projections, setProjections] = createSignal([])
	const [newProjectionTitle, setNewProjectionTitle] = createSignal("")
	const [newProjectionValue, setNewProjectionValue] = createSignal(0)
	const [newProjectionCron, setNewProjectionCron] = createSignal(DEFAULT_CRON)
	const [projectionCreatedAt, setProjectionCreatedAt] = createSignal(null)
	const [shown, setShown] = createSignal(true)
	const [importerOn, setImporterOn] = createSignal(false)
	let titleRef

	Tracker.autorun(async () => {
		setIsReady(subscription.ready())
		const projections = await Projections.find({}, { sort: { createdAt: 1 } }).fetchAsync()
		setProjections(projections)
	})

	function resetInsertForm() {
		setNewProjectionTitle("")
		setNewProjectionValue(0)
		// setNewProjectionCron(DEFAULT_CRON)
		setProjectionCreatedAt(null)
		titleRef.focus()
	}

	const addProjection = async (e) => {
		e.preventDefault()
		await Meteor.callAsync("projections/insert", {
			title: newProjectionTitle(),
			value: newProjectionValue(),
			cron: newProjectionCron(),
			createdAt: projectionCreatedAt(),
		})
		resetInsertForm()
	}

	const deleteProjection = async (projectionId) => {
		const { title, value, cron, createdAt } = await Projections.findOneAsync({
			_id: projectionId,
		})
		await Meteor.callAsync("projections/remove", projectionId)

		setNewProjectionTitle(title)
		setNewProjectionValue(value)
		setNewProjectionCron(cron)
		setProjectionCreatedAt(createdAt)
	}
	const clearAll = async () => {
		await Meteor.callAsync("projections/clear")

		setNewProjectionTitle(title)
		setNewProjectionValue(value)
		setNewProjectionCron(cron)
		setProjectionCreatedAt(null)
	}

	const explainCron = (cronstr) => {
		return cronstrue.toString(cronstr || DEFAULT_CRON)
	}
	const toggleShown = () => setShown(!shown())
	const toggleImporter = () => setImporterOn(!importerOn())

	return (
		<>
			<div class={styles["projections-admin"]} id="projections-admin">
				<h3>Projections</h3>
				<button onClick={toggleShown}>{shown() ? "Hide" : "Show"} List</button>
				<button onClick={toggleImporter}>{importerOn() ? "Hide" : "Show"} Importer</button>
				<div style={{ display: shown() ? "block" : "none" }}>
					<h4>
						Add Projection{" "}
						<span>
							<span
								class={`${styles.closebtn} ${styles.smaller}`}
								onClick={() => clearAll()}
							>
								&times; clear all
							</span>
						</span>
					</h4>
					<form class={styles["input-grid"]} onSubmit={addProjection}>
						<div>
							<input
								ref={titleRef}
								type="text"
								value={newProjectionTitle()}
								onChange={(e) => setNewProjectionTitle(e.target.value)}
								placeholder="Title"
							/>
							<span class={styles.closebtn} onClick={() => resetInsertForm()}>
								&times;
							</span>
						</div>
						<div>
							<input
								type="number"
								value={newProjectionValue()}
								onChange={(e) => setNewProjectionValue(Number(e.target.value))}
								placeholder="Value"
							/>
						</div>
						<div>
							<input
								type="text"
								value={newProjectionCron()}
								onKeyUp={(e) => setNewProjectionCron(e.target.value)}
								placeholder="Cron"
							/>
						</div>
						<div>
							<button class="submit" type="submit">
								Add Projection
							</button>
						</div>

						<div style={{ "grid-column": "span 2" }}></div>
						<div>{explainCron(newProjectionCron())}</div>
					</form>
					<ul>
						{projections().map((projection, index) => (
							<li key={projection._id}>
								{projection.value} "{projection.title}"{" "}
								{explainCron(projection.cron).replace("At 12:00 AM,", "")}
								<button
									class={`${styles.linkbtn} ${styles.closebtn}`}
									onClick={() => deleteProjection(projection._id)}
								>
									&times;
								</button>
							</li>
						))}
					</ul>
				</div>
			</div>
			{importerOn() && <Importer cron={newProjectionCron()} />}
		</>
	)
}
