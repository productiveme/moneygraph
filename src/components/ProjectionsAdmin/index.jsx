import { useState, useRef } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import cronstrue from 'cronstrue'
import styles from './ProjectionsAdmin.module.scss'
import { Importer } from '../Importer'

const GET_PROJECTIONS = gql`
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

const ADD_PROJECTION = gql`
  mutation AddProjection($title: String!, $value: Float!, $cron: String!, $createdAt: String) {
    addProjection(title: $title, value: $value, cron: $cron, createdAt: $createdAt) {
      id
      title
      value
      cron
      createdAt
    }
  }
`

const DELETE_PROJECTION = gql`
  mutation DeleteProjection($id: ID!) {
    deleteProjection(id: $id)
  }
`

const CLEAR_PROJECTIONS = gql`
  mutation ClearProjections {
    clearProjections
  }
`

export const ProjectionsAdmin = () => {
  const DEFAULT_CRON = "0 0 1 * *"
  const [shown, setShown] = useState(true)
  const [importerOn, setImporterOn] = useState(false)
  const [newProjection, setNewProjection] = useState({
    title: "",
    value: 0,
    cron: DEFAULT_CRON,
    createdAt: null
  })
  
  const titleRef = useRef()
  const { loading, error, data } = useQuery(GET_PROJECTIONS)
  const [addProjection] = useMutation(ADD_PROJECTION, {
    refetchQueries: [{ query: GET_PROJECTIONS }]
  })
  const [deleteProjection] = useMutation(DELETE_PROJECTION, {
    refetchQueries: [{ query: GET_PROJECTIONS }]
  })
  const [clearProjections] = useMutation(CLEAR_PROJECTIONS, {
    refetchQueries: [{ query: GET_PROJECTIONS }]
  })

  const resetForm = () => {
    setNewProjection({
      title: "",
      value: 0,
      cron: DEFAULT_CRON,
      createdAt: null
    })
    titleRef.current?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await addProjection({
      variables: newProjection
    })
    resetForm()
  }

  const handleDelete = async (id) => {
    const projection = data.projections.find(p => p.id === id)
    await deleteProjection({ variables: { id } })
    setNewProjection(projection)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <>
      <div className={styles.projectionsAdmin} id="projections-admin">
        <h3>Projections</h3>
        <button onClick={() => setShown(!shown)}>{shown ? "Hide" : "Show"} List</button>
        <button onClick={() => setImporterOn(!importerOn)}>
          {importerOn ? "Hide" : "Show"} Importer
        </button>
        
        {shown && (
          <div>
            <h4>
              Add Projection{" "}
              <span>
                <span
                  className={`${styles.closebtn} ${styles.smaller}`}
                  onClick={() => clearProjections()}
                >
                  &times; clear all
                </span>
              </span>
            </h4>
            
            <form className={styles.inputGrid} onSubmit={handleSubmit}>
              <div>
                <input
                  ref={titleRef}
                  type="text"
                  value={newProjection.title}
                  onChange={(e) => setNewProjection({...newProjection, title: e.target.value})}
                  placeholder="Title"
                />
                <span className={styles.closebtn} onClick={resetForm}>
                  &times;
                </span>
              </div>
              
              <div>
                <input
                  type="number"
                  value={newProjection.value}
                  onChange={(e) => setNewProjection({...newProjection, value: Number(e.target.value)})}
                  placeholder="Value"
                />
              </div>
              
              <div>
                <input
                  type="text"
                  value={newProjection.cron}
                  onChange={(e) => setNewProjection({...newProjection, cron: e.target.value})}
                  placeholder="Cron"
                />
              </div>
              
              <div>
                <button className="submit" type="submit">
                  Add Projection
                </button>
              </div>

              <div style={{ gridColumn: "span 2" }}></div>
              <div>{cronstrue.toString(newProjection.cron || DEFAULT_CRON)}</div>
            </form>

            <ul>
              {data.projections.map((projection) => (
                <li key={projection.id}>
                  {projection.value} "{projection.title}"{" "}
                  {cronstrue.toString(projection.cron).replace("At 12:00 AM,", "")}
                  <button
                    className={`${styles.linkbtn} ${styles.closebtn}`}
                    onClick={() => handleDelete(projection.id)}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {importerOn && <Importer cron={newProjection.cron} />}
    </>
  )
}
