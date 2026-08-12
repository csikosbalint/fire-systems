import React from 'react'

/**
 * DisciplineTracker - Placeholder component for future discipline tracking features
 *
 * This component serves as a foundation for displaying trading discipline metrics
 * such as win rate, rule adherence, streak counts, and other behavioral statistics.
 *
 * TODO: Integrate with state management and define discipline metrics
 */
export default function DisciplineTracker() {
  return (
    <div className="space-y-4">
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Discipline Tracker
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Trading discipline and behavioral metrics
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          Coming soon: Discipline metrics and performance tracking
        </p>
      </div>
    </div>
  )
}
