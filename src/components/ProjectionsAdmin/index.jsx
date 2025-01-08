import { useRef } from 'preact/hooks'
import { useQuery, useMutation } from 'urql'
import cronstrue from 'cronstrue'
import useProjectionsStore from '../../store/projections'
import { Importer } from '../Importer'

const GET_PROJECTIONS = `
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

const ADD_PROJECTION = `
  mutation AddProjection($title: String!, $value: Float!, $cron: String!, $createdAt: String) {
    addProjection(title: $title, value: $value, cron: $cron, createdAt: $createdAt) {
      id
    }
  }
`

const DELETE_PROJECTION = `
  mutation DeleteProjection($id: ID!) {
    deleteProjection(id: $id)
  }
`

const CLEAR_PROJECTIONS = `
  mutation ClearProjections {
    clearProjections
  }
`

export function ProjectionsAdmin() {
  const {
    shown,
    importerShown,
    newProjection,
    toggleShown,
    toggleImporter,
    setNewProjection,
    resetNewProjection
  } = useProjectionsStore()

  const titleRef = useRef()
  const [{ data, fetching, error }] = useQuery({ query: GET_PROJECTIONS })
  const [, addProjection] = useMutation(ADD_PROJECTION)
  const [, deleteProjection] = useMutation(DELETE_PROJECTION)
  const [, clearProjections] = useMutation(CLEAR_PROJECTIONS)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await addProjection(newProjection)
    if (!result.error) {
      resetNewProjection()
      titleRef.current?.focus()
    }
  }

  const handleDelete = async (id) => {
    await deleteProjection({ id })
  }

  if (fetching) return <div class="text-center py-4">Loading...</div>
  if (error) return <div class="text-red-500 py-4">Error: {error.message}</div>

  return (
    <div class="mt-8 bg-white p-6 rounded-lg shadow-sm">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-semibold">Projections</h3>
        <div>
          <button onClick={toggleShown} class="btn btn-primary mr-2">
            {shown ? "Hide" : "Show"} List
          </button>
          <button onClick={toggleImporter} class="btn btn-primary">
            {importerShown ? "Hide" : "Show"} Importer
          </button>
        </div>
      </div>

      {shown && (
        <div>
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-xl font-medium">Add Projection</h4>
            <button
              onClick={() => clearProjections()}
              class="text-red-600 hover:text-red-700 text-sm"
            >
              × clear all
            </button>
          </div>

          <form onSubmit={handleSubmit} class="grid grid-cols-4 gap-4">
            <div class="col-span-2">
              <input
                ref={titleRef}
                type="text"
                class="input w-full"
                value={newProjection.title}
                onInput={(e) => setNewProjection({...newProjection, title: e.target.value})}
                placeholder="Title"
              />
            </div>
            
            <div>
              <input
                type="number"
                class="input w-full"
                value={newProjection.value}
                onInput={(e) => setNewProjection({...newProjection, value: Number(e.target.value)})}
                placeholder="Value"
              />
            </div>
            
            <div>
              <input
                type="text"
                class="input w-full"
                value={newProjection.cron}
                onInput={(e) => setNewProjection({...newProjection, cron: e.target.value})}
                placeholder="Cron"
              />
            </div>

            <div class="col-span-2">
              <p class="text-sm text-gray-600">
                {cronstrue.toString(newProjection.cron)}
              </p>
            </div>

            <div class="col-span-2">
              <button type="submit" class="btn btn-primary">
                Add Projection
              </button>
            </div>
          </form>

          <ul class="mt-6 space-y-2">
            {data?.projections.map((projection) => (
              <li key={projection.id} class="flex justify-between items-center py-2 border-b">
                <span>
                  {projection.value} "{projection.title}"{" "}
                  <span class="text-gray-600">
                    {cronstrue.toString(projection.cron).replace("At 12:00 AM,", "")}
                  </span>
                </span>
                <button
                  onClick={() => handleDelete(projection.id)}
                  class="text-red-600 hover:text-red-700"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {importerShown && <Importer />}
    </div>
  )
}
