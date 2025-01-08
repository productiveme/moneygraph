import { Graph } from "./Graph"
import { ProjectionsAdmin } from "./ProjectionsAdmin"
import "../css/global.scss"

export const App = () => (
	<div>
		<h1>Moneygraph</h1>
		<Graph />
		<ProjectionsAdmin />
	</div>
)
