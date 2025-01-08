import styles from "./style.module.scss"
import { createSignal } from "solid-js"
import yamlParser from "js-yaml"
import { Projections } from "../../api/projections"

export const Importer = ({ reverseSign = true, cron = "" }) => {
	const [yaml, setYaml] = createSignal("")
	const [reverseSignOn, setReverseSign] = createSignal(reverseSign)
	const [txtRef, setTxtRef] = createSignal(null)

	const importYaml = async (e) => {
		e.preventDefault()
		function getNumberKeyValues(obj, defaultCron = cron) {
			const result = []
			const pushItem = (key, value, cron) =>
				result.push({ title: key, value: reverseSignOn() ? value * -1 : value, cron })

			function recursiveWalk(obj, parentKey = "", parentCron = defaultCron) {
				if (typeof obj === "object") {
					for (const key in obj) {
						if (Object.prototype.hasOwnProperty.call(obj, key)) {
							const value = obj[key]
							if (key.startsWith("_")) {
								if (key === "_cron") {
									parentCron = value
								} else {
									continue
								}
							}
							if (value === 0) continue
							const currentKey = parentKey ? `${parentKey}/${key}` : key
							if (typeof value === "number") {
								pushItem(currentKey, value, parentCron)
							} else if (typeof value === "object") {
								recursiveWalk(value, currentKey, parentCron)
							}
						}
					}
				} else if (Array.isArray(obj)) {
					obj.forEach((value, index) => {
						const currentKey = parentKey ? `${parentKey}/${index}` : index.toString()
						if (typeof value === "number") {
							pushItem(currentKey, value, parentCron)
						} else if (typeof value === "object") {
							recursiveWalk(value, currentKey, parentCron)
						}
					})
				}
			}

			recursiveWalk(obj)
			return result
		}
		let data = yamlParser.load(yaml())
		setYaml("")

		for (const item of getNumberKeyValues(data)) {
			await Meteor.callAsync("projections/insert", item)
		}

		txtRef().value = ""
	}
	const exportYaml = async (e) => {
		e.preventDefault()
		const data = await Projections.find({}, { sort: { createdAt: 1 } }).fetchAsync()
		const yaml = data.reduce((cur, projection) => {
			let parentTitle = projection.title.split("/").slice(0, -1).join("/")
			while (parentTitle.split("/").length > 1) {
				if (!cur[parentTitle]) cur[parentTitle] = { title: parentTitle.split("/").pop() }
				parentTitle = parentTitle.split("/").slice(0, -1).join("/")
			}
			if (!cur[parentTitle]) cur[parentTitle] = { title: parentTitle.split("/").pop() }

			return {
				...cur,
				[projection.title]: {
					title: projection.title.split("/").pop(),
					value: reverseSignOn() ? projection.value * -1 : projection.value,
				},
			}
		}, {})
		setYaml(
			Object.entries(yaml)
				.sort((a, b) => a[0].localeCompare(b[0]))
				.map(
					([path, { title, value }]) =>
						`${"  ".repeat(path.split("/").length - 1)}${title}: ${value || ""}`
				)
				.join("\n")
		)
	}
	return (
		<>
			<h3>Import Projections</h3>
			<p>Import title / value pairs from a YAML file</p>
			<form class={styles.centered} onSubmit={importYaml}>
				<textarea
					ref={setTxtRef}
					placeholder="Import YAML here"
					onChange={(e) => setYaml(e.target.value)}
				>
					{yaml()}
				</textarea>
				<div>
					<label>
						<input
							type="checkbox"
							name="reverseSign"
							checked={reverseSignOn}
							onChange={(e) => setReverseSign(e.target.checked)}
						></input>
						Reverse sign for imported values
					</label>
					<button class="submit">Import</button>
					<button onClick={exportYaml}>Export</button>
				</div>
			</form>
		</>
	)
}
