import {signal} from '@preact/signals-react'
import useWebSocket from 'react-use-websocket'
import {ProgressBar, ProgressState} from './progress.bar'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {formatMilliseconds} from '../utils/formats'

const start = signal(0)
const STALE_TIME = 10_000

export const ProgressModal = () => {
  const {lastJsonMessage} = useWebSocket('ws://localhost:8000/ws', {
    shouldReconnect: () => true,
    onClose: () => reset(),
  })

  const [elapsed, setElapsed] = useState(0)
  const [lastUpdate, setLastUpdate] = useState(+new Date())
  const [stale, setStale] = useState(0)
  const [storm, setStorm] = useState('')
  const [both, setBoth] = useState({} as ProgressState)
  const [surge, setSurge] = useState({} as ProgressState)
  const [tide, setTide] = useState({} as ProgressState)
  const showModal = useMemo(
    () => both.state === 'running' || surge.state === 'running' || tide.state === 'running',
    [both, surge, tide]
  )

  const reset = useCallback(() => {
    setBoth({} as ProgressState)
    setTide({} as ProgressState)
    setSurge({} as ProgressState)
  }, [])

  useEffect(() => {
    if (!lastJsonMessage) return
    const message = lastJsonMessage as ProgressState
    setStorm(message.storm)
    setLastUpdate(+new Date())
    if (message.name === 'Surge') setSurge(message)
    if (message.name === 'Tide') setTide(message)
    if (message.name === 'Both') setBoth(message)
  }, [lastJsonMessage])

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = +new Date()
      setElapsed(now - start.value)
      setStale(now - lastUpdate)
    }, 500)
    return () => clearInterval(intervalId)
  }, [lastUpdate])

  if (!showModal) {
    start.value = 0
    return null
  }
  if (start.value === 0) {
    start.value = +new Date()
  }

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
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div>Elapsed time: {formatMilliseconds(elapsed)}</div>
          <div>{storm}</div>
        </div>
        <ProgressBar data={both} color="green" />
        <ProgressBar data={surge} color="red" />
        <ProgressBar data={tide} color="blue" />
        {stale > STALE_TIME && (
          <div style={{margin: '-20px', marginTop: 0}}>
            <div style={{padding: '5px 20px', backgroundColor: 'rgba(255, 255, 0, 0.5)', fontWeight: 'bold'}}>
              Warning
            </div>
            <div
              style={{
                display: 'flex',
                gap: 10,
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '20px',
                paddingTop: '10px',
              }}
            >
              <div>Is the model running? No update for {formatMilliseconds(stale)}</div>
              <div>
                <button type="button" onClick={reset}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
