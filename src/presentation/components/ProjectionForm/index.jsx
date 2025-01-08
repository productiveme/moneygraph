import { useState } from 'preact/hooks'
import { makeProjectionForm } from '../../../domain/entities/projection-form'
import { makeCronParser } from '../../../domain/services/cron-parser'

export function ProjectionForm({ onSubmit, initialData = {} }) {
  const cronParser = makeCronParser()
  const [form, setForm] = useState(() => 
    makeProjectionForm({
      ...initialData,
      cronParser
    })
  )
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const validationErrors = form.validate()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(form.toProjection())
    }
  }

  const handleChange = (field) => (e) => {
    const value = field === 'value' ? Number(e.target.value) : e.target.value
    const updatedForm = form[`with${field.charAt(0).toUpperCase() + field.slice(1)}`](value)
    setForm(updatedForm)
    
    if (touched[field]) {
      const validationErrors = updatedForm.validate()
      setErrors(prev => ({ ...prev, [field]: validationErrors[field] }))
    }
  }

  const handleBlur = (field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const validationErrors = form.validate()
    setErrors(prev => ({ ...prev, [field]: validationErrors[field] }))
  }

  return (
    <form onSubmit={handleSubmit} class="grid grid-cols-4 gap-4">
      <div class="col-span-2">
        <input
          type="text"
          class={`input w-full ${errors.title ? 'border-red-500' : ''}`}
          value={form.getTitle()}
          onInput={handleChange('title')}
          onBlur={handleBlur('title')}
          placeholder="Title"
        />
        {errors.title && touched.title && (
          <p class="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>
      
      <div>
        <input
          type="number"
          class={`input w-full ${errors.value ? 'border-red-500' : ''}`}
          value={form.getValue()}
          onInput={handleChange('value')}
          onBlur={handleBlur('value')}
          placeholder="Value"
        />
        {errors.value && touched.value && (
          <p class="text-red-500 text-sm mt-1">{errors.value}</p>
        )}
      </div>
      
      <div>
        <input
          type="text"
          class={`input w-full ${errors.cron ? 'border-red-500' : ''}`}
          value={form.getCron()}
          onInput={handleChange('cron')}
          onBlur={handleBlur('cron')}
          placeholder="Cron"
        />
        {errors.cron && touched.cron && (
          <p class="text-red-500 text-sm mt-1">{errors.cron}</p>
        )}
      </div>

      <div class="col-span-2">
        <p class="text-sm text-gray-600">
          {form.getCronExplanation()}
        </p>
      </div>

      <div class="col-span-2">
        <button 
          type="submit" 
          class="btn btn-primary"
          disabled={!form.isValid()}
        >
          Add Projection
        </button>
      </div>
    </form>
  )
}
