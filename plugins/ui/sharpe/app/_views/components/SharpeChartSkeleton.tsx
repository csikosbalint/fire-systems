import { Skeleton } from '@ui/skeleton'

export default function SharpeChartSkeleton() {
  return (
    <div className="flex h-full w-full flex-col gap-3 p-2" aria-busy="true" aria-label="Loading sharpe chart">
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-14" />
      </div>
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 flex flex-col justify-between py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-px w-full" />
          ))}
        </div>
        <svg
          className="absolute inset-x-4 inset-y-6 h-[calc(100%-3rem)] w-[calc(100%-2rem)] text-muted-foreground/40"
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0 28 C 12 26, 18 18, 28 20 S 42 30, 52 22 S 68 8, 78 14 S 92 24, 100 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            className="animate-pulse"
          />
          <path
            d="M0 22 C 14 24, 22 30, 34 26 S 50 12, 62 16 S 78 28, 88 22 S 96 14, 100 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.55"
            vectorEffect="non-scaling-stroke"
            className="animate-pulse"
          />
        </svg>
      </div>
      <div className="flex justify-between gap-2 px-1">
        <Skeleton className="h-2.5 w-12" />
        <Skeleton className="h-2.5 w-12" />
        <Skeleton className="h-2.5 w-12" />
        <Skeleton className="h-2.5 w-12" />
      </div>
    </div>
  )
}
