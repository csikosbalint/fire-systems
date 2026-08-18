import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TrackerPivot } from '@shared/types/DisciplineTracker'

type DisciplineTrackerStore = {
  initialCapital: number
  pivots: TrackerPivot[]
  setInitialCapital: (initialCapital: number) => void
  addPivot: (pivot: TrackerPivot) => boolean
  removePivot: (pivotId: string) => void
}

const useDisciplineTrackerStore = create<DisciplineTrackerStore>()(
  persist(
    (set, get) => ({
      initialCapital: 100_000,
      pivots: [],
      setInitialCapital: (initialCapital) => {
        if (!Number.isFinite(initialCapital) || initialCapital <= 0) return
        set({ initialCapital })
      },
      addPivot: (pivot) => {
        if (get().pivots.some((existing) => existing.date === pivot.date)) {
          return false
        }
        set((state) => ({
          pivots: [...state.pivots, pivot].sort((left, right) =>
            left.date.localeCompare(right.date)
          ),
        }))
        return true
      },
      removePivot: (pivotId) =>
        set((state) => ({
          pivots: state.pivots.filter((pivot) => pivot.id !== pivotId),
        })),
    }),
    { name: 'discipline-tracker' }
  )
)

export default useDisciplineTrackerStore
