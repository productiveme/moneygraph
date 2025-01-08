import useProjectionsStore from '../../store/projections'

export function Settings() {
  const { startValue, endGoal, setStartValue, setEndGoal } = useProjectionsStore()

  return (
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <h2 class="text-2xl font-bold mb-6">Settings</h2>
      
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Default Start Value
          </label>
          <input
            type="number"
            class="input w-full max-w-xs"
            value={startValue}
            onChange={(e) => setStartValue(Number(e.target.value))}
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Default Goal Value
          </label>
          <input
            type="number"
            class="input w-full max-w-xs"
            value={endGoal}
            onChange={(e) => setEndGoal(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  )
}
