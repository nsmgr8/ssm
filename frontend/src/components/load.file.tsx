export type LoadFileProps = JSX.IntrinsicElements['input'] & {
  id: string
  label: string
}

export const LoadFile = ({id, label, ...props}: LoadFileProps) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: '3px',
      borderBottom: '1px solid black',
      paddingBottom: '2px',
    }}
  >
    <label htmlFor={id}>{label}</label>
    <input id={id} type="file" {...props} />
  </div>
)
