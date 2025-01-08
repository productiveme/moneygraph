import { memo } from 'preact/compat'
import { makeCronParser } from '../../../domain/services/cron-parser'

export const ProjectionList = memo(function ProjectionList({ 
  projections, 
  onDelete 
}) {
  const cronParser = makeCronParser()

  return (
    <ul class="mt-6 space-y-2">
      {projections.map((projection) => (
        <li 
          key={projection.getId()} 
          class="flex justify-between items-center py-2 border-b"
        >
          <span>
            {projection.getValue()} "{projection.getTitle()}"{" "}
            <span class="text-gray-600">
              {cronParser.explain(projection.getCron())}
            </span>
          </span>
          <button
            onClick={() => onDelete(projection.getId())}
            class="text-red-600 hover:text-red-700"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  )
})
