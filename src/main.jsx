import { render } from 'preact'
import { createClient, Provider } from 'urql'
import { App } from './App'
import './index.css'

const client = createClient({
  url: 'http://localhost:4000/graphql',
})

render(
  <Provider value={client}>
    <App />
  </Provider>,
  document.getElementById('app')
)
