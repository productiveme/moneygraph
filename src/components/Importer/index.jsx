import { useState, useRef } from 'react'
import { useMutation, gql } from '@apollo/client'
import yamlParser from 'js-yaml'
import styles from './Importer.module.scss'

const IMPORT_PROJECTIONS = gql`
  mutation ImportProjections($projections: [ProjectionInput!]!) {
    importProjections(projections: $projections) {
      id
      title
      value
      cron
    }
  }
`

export const Importer = ({ reverseSign = true, cron = "" }) => {
  const [yaml, setYaml] = useState("")
  const [reverseSignOn, setReverseSignOn] = useState(reverseSign)
  const textareaRef = useRef(null)
  
  const [importProjections] = useMutation(IMPORT_PROJECTIONS, {
    refetchQueries: ['GetProjections']
  })

  const importYaml = async (e) => {
    e.preventDefault()
    
    function getNumberKeyValues(obj, defaultCron = cron) {
      const result = []
      const pushItem = (key, value, cron) =>
        result.push({ title: key, value: reverseSignOn ? value * -1 : value, cron })

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
        }
      }

      recursiveWalk(obj)
      return result
    }

    try {
      const data = yamlParser.load(yaml)
      const projections = getNumberKeyValues(data)
      
      await importProjections({
        variables: { projections }
      })
      
      setYaml("")
      textareaRef.current.value = ""
    } catch (error) {
      console.error('Error importing YAML:', error)
    }
  }

  return (
    <>
      <h3>Import Projections</h3>
      <p>Import title / value pairs from a YAML file</p>
      <form className={styles.centered} onSubmit={importYaml}>
        <textarea
          ref={textareaRef}
          placeholder="Import YAML here"
          onChange={(e) => setYaml(e.target.value)}
          value={yaml}
        />
        <div>
          <label>
            <input
              type="checkbox"
              name="reverseSign"
              checked={reverseSignOn}
              onChange={(e) => setReverseSignOn(e.target.checked)}
            />
            Reverse sign for imported values
          </label>
          <button className="submit">Import</button>
        </div>
      </form>
    </>
  )
}
