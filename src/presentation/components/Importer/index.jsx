import { useState, useRef } from 'preact/hooks'
import useProjectionsStore from '../../store/projections'
import { makeYamlParser } from '../../../domain/services/yaml-parser'

export function Importer() {
  const [yaml, setYaml] = useState("")
  const [reverseSignOn, setReverseSignOn] = useState(true)
  const [error, setError] = useState(null)
  const textareaRef = useRef(null)
  
  const { importProjections } = useProjectionsStore()
  const yamlParser = makeYamlParser()

  const handleImport = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const projections = yamlParser.parseProjections(yaml, {
        reverseSign: reverseSignOn,
        defaultCron: "0 0 1 * *"
      })

      await importProjections(projections.map(p => p.serialize()))
      
      setYaml("")
      textareaRef.current.value = ""
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div class="mt-8 border-t pt-8">
      <h3 class="text-xl font-semibold mb-2">Import Projections</h3>
      <p class="text-gray-600 mb-4">Import title / value pairs from a YAML file</p>
      
      {error && (
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p class="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleImport} class="space-y-4">
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
