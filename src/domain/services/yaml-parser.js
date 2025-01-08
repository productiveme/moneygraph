import yaml from 'js-yaml'
import { makeYamlImport } from '../entities/yaml-import'
import { makeProjection } from '../entities/projection'

export const makeYamlParser = () => {
  const parseProjections = (content, { reverseSign = true, defaultCron }) => {
    if (!content.trim()) {
      return []
    }

    try {
      const parsedYaml = yaml.load(content)
      const yamlImport = makeYamlImport({
        content: parsedYaml,
        reverseSign,
        defaultCron
      })

      const projectionData = yamlImport.getNumberKeyValues(parsedYaml)
      return projectionData.map(data => makeProjection(data))
    } catch (error) {
      throw new Error(`Failed to parse YAML: ${error.message}`)
    }
  }

  return Object.freeze({
    parseProjections
  })
}
