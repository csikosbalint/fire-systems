import { IndicatorNames, type Indicators } from '@shared/consts/Enhance'

export async function enhance({
  data,
  with: indicator,
}: {
  data: object[]
  with: Indicators
}) {
  switch (indicator) {
    case IndicatorNames.SHARPE:
      break

    default:
      break
  }
}
