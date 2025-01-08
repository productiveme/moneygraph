import { create } from 'zustand'
import dayjs from 'dayjs'

const useProjectionsStore = create((set, get) => ({
  startDate: new Date(),
  startValue: 0,
  endDate: dayjs().add(3, 'month').toDate(),
  endGoal: 0,
  shown: true,
  importerShown: false,

  setStartDate: (date) => set({ startDate: date }),
  setStartValue: (value) => set({ startValue: value }),
  setEndDate: (date) => set({ endDate: date }),
  setEndGoal: (value) => set({ endGoal: value }),
  toggleShown: () => set((state) => ({ shown: !state.shown })),
  toggleImporter: () => set((state) => ({ importerShown: !state.importerShown })),

  // Form state
  newProjection: {
    title: "",
    value: 0,
    cron: "0 0 1 * *",
    createdAt: null
  },

  setNewProjection: (projection) => set({ newProjection: projection }),
  resetNewProjection: () => set({
    newProjection: {
      title: "",
      value: 0,
      cron: "0 0 1 * *",
      createdAt: null
    }
  })
}))

export default useProjectionsStore
