import { create } from 'zustand'
import dayjs from 'dayjs'
import { container } from '../../infrastructure/di/container'

const useProjectionsStore = create((set, get) => ({
  startDate: new Date(),
  startValue: 0,
  endDate: dayjs().add(3, 'month').toDate(),
  endGoal: 0,
  shown: true,
  importerShown: false,
  projections: [],
  loading: false,
  error: null,

  // Actions
  setStartDate: (date) => set({ startDate: date }),
  setStartValue: (value) => set({ startValue: value }),
  setEndDate: (date) => set({ endDate: date }),
  setEndGoal: (value) => set({ endGoal: value }),
  toggleShown: () => set((state) => ({ shown: !state.shown })),
  toggleImporter: () => set((state) => ({ importerShown: !state.importerShown })),

  // Async actions
  fetchProjections: async () => {
    set({ loading: true, error: null })
    try {
      const projectionList = await container.projectionUseCases.getAllProjections()
      set({ projections: projectionList.getAll(), loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  addProjection: async (projectionData) => {
    set({ loading: true, error: null })
    try {
      await container.projectionUseCases.addProjection(projectionData)
      get().fetchProjections()
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  removeProjection: async (id) => {
    set({ loading: true, error: null })
    try {
      await container.projectionUseCases.removeProjection(id)
      get().fetchProjections()
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  clearProjections: async () => {
    set({ loading: true, error: null })
    try {
      await container.projectionUseCases.clearProjections()
      get().fetchProjections()
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  importProjections: async (projections) => {
    set({ loading: true, error: null })
    try {
      await container.projectionUseCases.importProjections(projections)
      get().fetchProjections()
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  }
}))

export default useProjectionsStore
