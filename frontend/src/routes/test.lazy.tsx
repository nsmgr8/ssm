import {createLazyFileRoute} from '@tanstack/react-router'

export const Route = createLazyFileRoute('/test')({
  component: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridGap: 5,
      }}
    >
      <div style={{height: '100%', border: '1px solid black', gridRow: 'span 2'}}></div>
      <div style={{height: '300px', border: '1px solid black'}}></div>
      <div style={{height: '300px', border: '1px solid black'}}></div>
    </div>
  ),
})
