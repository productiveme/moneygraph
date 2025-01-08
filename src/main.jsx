import { render } from "preact"
import { createClient, Provider, cacheExchange, fetchExchange } from "urql"
import { App } from "./App"
import "./index.css"

const client = createClient({
	url: `http://localhost:${import.meta.env.VITE_GQL_PORT || 4000}/graphql`,
	exchanges: [cacheExchange, fetchExchange],
})

render(
	<Provider value={client}>
		<App />
	</Provider>,
	document.getElementById("app")
)
