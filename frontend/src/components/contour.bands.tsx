import {computed} from '@preact/signals-react'
import {zetaMax, zetaMin, contourBands} from '../stores/zeta'
import {ColorTuple, Threshold} from '../utils/colors'

export const ContourBands = () => (
  <div>
    <ColorBands bands={contourBands.value} showTitle />
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace'}}>
      {zetaBands.value.map((x) => (
        <span key={x}>{x.toFixed(1)}</span>
      ))}
    </div>
  </div>
)

type ColorBandsProps = {
  bands: {
    threshold: Threshold
    color: ColorTuple
  }[]
  showTitle?: boolean
}

export const ColorBands = ({bands, showTitle = false}: ColorBandsProps) => (
  <div style={{display: 'grid', gridTemplateColumns: `repeat(${bands.length}, 1fr)`}}>
    {bands.map(({threshold, color: [r, g, b]}, idx) => (
      <div
        key={idx}
        style={{backgroundColor: `rgb(${r}, ${g}, ${b})`}}
        title={showTitle ? `[${bandVal(threshold[0])}, ${bandVal(threshold[1])}]` : undefined}
      >
        &nbsp;
      </div>
    ))}
  </div>
)

const bandVal = (v: number) => (v + zetaMin.value).toFixed(2) + ' m'

const zetaBands = computed(() => {
  const diff = zetaMax.value - zetaMin.value
  return [
    zetaMin.value,
    zetaMin.value + diff / 4,
    zetaMin.value + diff / 2,
    zetaMin.value + (diff / 4) * 3,
    zetaMax.value,
  ]
})
