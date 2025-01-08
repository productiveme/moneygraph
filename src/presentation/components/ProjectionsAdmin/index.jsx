import { useEffect, useRef } from 'preact/hooks'
import cronstrue from 'cronstrue'
import useProjectionsStore from '../../store/projections'
import { makeProjection } from '../../../domain/entities/projection'
import { Importer } from '../Importer'

export function ProjectionsAdmin() {
  const {
    shown,
    importerShown,
    projections,
    loading,
    error,
    toggleShown,
    toggleImporter,
    fetchProjections,
    addProjection,
    removeProjection,
    clearProjections
  } = useProjectionsStore()

  const titleRef = useRef()
  const [formData, setFormData] = useState({
    title: '',
    value: 0,
    cron: '0 0 1 * *'
  })

  useEffect(() => {
    fetchProjections()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const projection = makeProjection(formData)
      await addProjection(projection.serialize())
      setFormData({ title: '', value: 0, cron: '0 0 1 * *' })
      titleRef.current?.focus()
    } catch (error) {
      console.error('Invalid projection data:', error)
    }
  }

  if (loading) return <div class="text-center py-4">Loading...</div>
  if (error) return <div class="text-red-500 py-4">Error: {error}</div>

  return (
    <div class="mt-8 bg-white p-6 rounded-lg shadow-sm">
      {/* Rest of the component remains similar, but uses the new immutable entities */}
      {/* ... */}
    </div>
  )
}
