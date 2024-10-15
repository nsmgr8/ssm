import {showUVZ} from '../stores/grid'

export const UVZToggle = () => (
  <fieldset>
    <label>
      <input
        type="checkbox"
        onChange={() => {
          showUVZ.value = !showUVZ.value
        }}
      />
      UVZ points
    </label>
  </fieldset>
)
