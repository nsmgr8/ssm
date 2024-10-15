import {Modes, selectionMode, selectedPoint} from '../stores/grid'

export const PointSelectionMode = () => (
  <fieldset>
    <legend>Point selection mode</legend>
    {Modes.map((value) => (
      <div key={value} style={{display: 'inline'}}>
        <input
          type="radio"
          id={`input-${value}`}
          name="mode"
          value={value}
          onChange={() => (selectionMode.value = value)}
          defaultChecked={value === selectionMode.value}
        />
        <label htmlFor={`input-${value}`}>{value}</label>
      </div>
    ))}
    <div>
      Current point: ({selectedPoint.value.row}, {selectedPoint.value.column})
    </div>
  </fieldset>
)
