import * as React from 'react'
import {Link, Outlet, createRootRoute} from '@tanstack/react-router'
import {Card} from '../components/card'
import useWebSocket from 'react-use-websocket'

export const Route = createRootRoute({
  component: () => (
    <React.Fragment>
      <Outlet />
      <NavCard />
      <ProgressModal />
    </React.Fragment>
  ),
})

type ProgressState = {
  name: 'Both' | 'Surge' | 'Tide'
  current: number
  total: number
  state: 'running' | 'completed'
}

const ProgressModal = () => {
  const {lastJsonMessage} = useWebSocket('ws://localhost:8000/ws', {
    shouldReconnect: () => true,
    onClose: () => {
      setBoth({} as ProgressState)
      setTide({} as ProgressState)
      setSurge({} as ProgressState)
    },
  })

  const [both, setBoth] = React.useState({} as ProgressState)
  const [surge, setSurge] = React.useState({} as ProgressState)
  const [tide, setTide] = React.useState({} as ProgressState)
  const showModal = React.useMemo(
    () => both.state === 'running' || surge.state === 'running' || tide.state === 'running',
    [both, surge, tide]
  )

  React.useEffect(() => {
    if (!lastJsonMessage) return
    const message = lastJsonMessage as ProgressState
    if (message.name === 'Surge') setSurge(message)
    if (message.name === 'Tide') setTide(message)
    if (message.name === 'Both') setBoth(message)
  }, [lastJsonMessage])

  if (!showModal) return null

  return (
    <div
      style={{
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(100, 100, 100, 0.5)',
        position: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          gap: 10,
          padding: '20px',
        }}
      >
        <Progress data={both} color="green" />
        <Progress data={surge} color="red" />
        <Progress data={tide} color="blue" />
      </div>
    </div>
  )
}

type ProgressProps = {
  data: ProgressState
  color: string
}

const Progress = ({data, color}: ProgressProps) => {
  if (!data.name) return null
  return (
    <div style={{display: 'flex', justifyContent: 'space-between', gap: 10, width: '360px'}}>
      <div>{data.name}</div>
      <div style={{width: '100%', backgroundColor: '#aaa'}}>
        <div style={{width: `${(data.current / data.total) * 100}%`, backgroundColor: color}}>&nbsp;</div>
      </div>
      <div>
        {data.current}/{data.total}
      </div>
    </div>
  )
}

const NavCard = () => (
  <Card style={{bottom: 10, top: '', display: 'flex', gap: '10px'}}>
    <Link to="/">Grid</Link>
    <Link to="/coast">Coast timeseries</Link>
    <Link to="/zeta">Contour</Link>
  </Card>
)
