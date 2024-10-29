import {computed} from '@preact/signals-react'
import {numBands, zetaMax, zetaMin, contourBands} from '../stores/zeta'

export const ContourBands = () => (
  <div>
    <div style={{display: 'grid', gridTemplateColumns: `repeat(${numBands.value + 1}, 1fr)`}}>
      {contourBands.value.map(({threshold, color: [r, g, b]}, idx) => (
        <div
          key={idx}
          style={{backgroundColor: `rgb(${r}, ${g}, ${b})`}}
          title={`from ${(threshold[0] + zetaMin.value).toFixed(2)} to ${(threshold[1] + zetaMin.value).toFixed(2)}`}
        >
          &nbsp;
        </div>
      ))}
    </div>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace'}}>
      {zetaBands.value.map((x) => (
        <span key={x}>{x.toFixed(1)}</span>
      ))}
    </div>
  </div>
)

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
