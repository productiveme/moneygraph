import { useState, useRef } from 'preact/hooks'
import { useMutation } from 'urql'
import yamlParser from 'js-yaml'
import useProjectionsStore from '../../store/projections'

const IMPORT_PROJECTIONS = `
  mutation ImportProjections($projections: [ProjectionInput!]!) {
    importProjections(projections: $projections) {
      id
      title
      value
      cron
    }
  }
`

export function Importer() {
  const [yaml, setYaml] = useState("")
  const [reverseSignOn, setReverseSignOn] = useState(true)
  const textareaRef = useRef(null)
  const { newProjection } = useProjectionsStore()
  const [, importProjections] = useMutation(IMPORT_PROJECTIONS)

  const importYaml = async (e) => {
    e.preventDefault()
    
    function getNumberKeyValues(obj, defaultCron = newProjection.cron) {
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
      
      await importProjections({ projections })
      
      setYaml("")
      textareaRef.current.value = ""
    } catch (error) {
      console.error('Error importing YAML:', error)
    }
  }

  return (
    <div class="mt-8 border-t pt-8">
      <h3 class="text-xl font-semibold mb-2">Import Projections</h3>
      <p class="text-gray-600 mb-4">Import title / value pairs from a YAML file</p>
      <form onSubmit={importYaml} class="space-y-4">
        <textarea
          ref={textareaRef}
          class="w-full h-40 input font-mono"
          placeholder="Import YAML here"
          onChange={(e) => setYaml(e.target.value)}
          value={yaml}
        />
        <div class="flex items-center space-x-4">
          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              class="rounded text-blue-600"
              checked={reverseSignOn}
              onChange={(e) => setReverseSignOn(e.target.checked)}
            />
            <span class="text-sm text-gray-700">Reverse sign for imported values</span>
          </label>
          <button type="submit" class="btn btn-primary">
            Import
          </button>
        </div>
      </form>
    </div>
  )
}
