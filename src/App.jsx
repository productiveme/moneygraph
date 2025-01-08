import { Router, Route, Link } from 'wouter'
import { Graph } from './components/Graph'
import { ProjectionsAdmin } from './components/ProjectionsAdmin'
import { Settings } from './components/Settings'

export function App() {
  return (
    <Router>
      <div class="container mx-auto px-4 py-8">
        <nav class="mb-8">
          <ul class="flex space-x-4">
            <li>
              <Link href="/">
                <a class="text-blue-600 hover:text-blue-800">Dashboard</a>
              </Link>
            </li>
            <li>
              <Link href="/settings">
                <a class="text-blue-600 hover:text-blue-800">Settings</a>
              </Link>
            </li>
          </ul>
        </nav>

        <Route path="/">
          <h1 class="text-4xl font-bold mb-8">Moneygraph</h1>
          <Graph />
          <ProjectionsAdmin />
        </Route>

        <Route path="/settings">
          <Settings />
        </Route>
      </div>
    </Router>
  )
}
