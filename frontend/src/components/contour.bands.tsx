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

const bandVal = (v: number) => (v + zetaMin.value.value).toFixed(2) + ' m'

const zetaBands = computed(() => {
  const minValue = zetaMin.value.value
  const diff = zetaMax.value.value - minValue
  return [minValue, minValue + diff / 4, minValue + diff / 2, minValue + (diff / 4) * 3, zetaMax.value.value]
})
