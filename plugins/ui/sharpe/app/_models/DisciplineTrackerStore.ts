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
        if (pivot.alertDate && pivot.alertDate > pivot.date) {
          return false
        }
        const nextPivots = [...get().pivots, pivot].sort((left, right) =>
          left.date.localeCompare(right.date)
        )
        if (
          nextPivots.some(
            (existing, index) =>
              (existing.id !== pivot.id && existing.date === pivot.date) ||
              (index > 0 &&
                (existing.alertDate ?? existing.date) <=
                  (nextPivots[index - 1].alertDate ?? nextPivots[index - 1].date))
          )
        ) {
          return false
        }
        set({ pivots: nextPivots })
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
