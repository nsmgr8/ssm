type FormInputProps = {
  label: string
  name: string
  value: number
}

export const FormInput = ({label, name, value}: FormInputProps) => (
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
      step="any"
      defaultValue={value}
      style={{width: '70px', marginLeft: '5px'}}
    />
  </div>
)
