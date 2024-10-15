import {ComponentProps, ReactElement, ReactHTMLElement} from 'react'

type CardProps = ComponentProps<'div'> & {
  top?: number
  left?: number
}

export const Card = ({top = 10, left = 10, children, style, ...props}: CardProps) => (
  <div
    {...props}
    style={{
      position: 'fixed',
      top,
      left,
      backgroundColor: 'white',
      padding: '10px',
      ...style,
    }}
  >
    {children}
  </div>
)
