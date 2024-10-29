type FormInputProps = {
  label: string
  name: string
  value: number
  min?: number
  max?: number
  step?: string
}

export const FormInput = ({label, name, value, min = 0, max, step = 'any'}: FormInputProps) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '3px',
    }}
  >
    <label htmlFor={`input-${name}`}>{label}</label>
    <input
      id={`input-${name}`}
      name={name}
      type="number"
      min={min}
      max={max}
      step={step}
      defaultValue={value}
      style={{width: '70px', marginLeft: '5px'}}
    />
  </div>
)
