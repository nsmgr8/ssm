import useWebSocket from 'react-use-websocket'
import {ProgressBar, ProgressState} from './progress.bar'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {formatMilliseconds, titleCase} from '../utils/formats'
import {IntervalType} from '../utils/types'

const STALE_TIME = 30_000
type RunState = Record<ProgressState['name'], ProgressState>
const BarColors: Record<ProgressState['name'], string> = {
  Both: 'green',
  Surge: 'red',
  Tide: 'blue',
  None: 'black',
}
const RunTypes = Object.keys(BarColors) as Array<keyof typeof BarColors>

export const ProgressModal = () => {
  const {lastJsonMessage} = useWebSocket('ws://localhost:8000/ws', {
    shouldReconnect: () => true,
    onClose: () => reset(),
  })

  const [start, setStart] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [elapsedId, setElapsedId] = useState<IntervalType>()

  const [lastUpdate, setLastUpdate] = useState(+new Date())
  const [stale, setStale] = useState(0)
  const [staleId, setStaleId] = useState<IntervalType>()

  const [storm, setStorm] = useState('')

  const [runState, setRunState] = useState({} as RunState)
  const showModal = useMemo(() => Object.values(runState).filter((x) => x.state === 'running').length > 0, [runState])

  useEffect(() => {
    if (!showModal) {
      setStart(0)
    }
  }, [showModal])

  const reset = useCallback(() => {
    setRunState({} as RunState)
    clearInterval(elapsedId)
    clearInterval(staleId)
  }, [staleId, elapsedId])

  useEffect(() => {
    if (!lastJsonMessage) return
    const message = lastJsonMessage as ProgressState
    setStorm(titleCase(message.storm.replace('-', ' ')))
    setLastUpdate(+new Date())
    setRunState((state) => ({...state, [message.name]: message}))
  }, [lastJsonMessage])

  useEffect(() => {
    const intId = setInterval(() => {
      const now = +new Date()
      setElapsed(now - start)
    }, 500)
    setElapsedId(intId)
    return () => clearInterval(intId)
  }, [start])

  useEffect(() => {
    const intId = setInterval(() => {
      const now = +new Date()
      setStale(now - lastUpdate)
    }, 500)
    setStaleId(intId)
    return () => clearInterval(intId)
  }, [lastUpdate])

  if (!showModal) {
    clearInterval(elapsedId)
    clearInterval(staleId)
    return null
  }

  if (start === 0) {
    const now = +new Date()
    setStart(now)
    setLastUpdate(now)
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 3fr 1fr 1fr',
            gap: 10,
            textAlign: 'right',
            fontFamily: 'monospace',
          }}
        >
          {RunTypes.map((k) => runState[k]?.name && <ProgressBar data={runState[k]} color={BarColors[k]} />)}
        </div>
        {stale > STALE_TIME && <StaleWarning reset={reset} stale={stale} />}
      </div>
    </div>
  )
}

type StaleWarningProps = {
  stale: number
  reset: () => void
}

const StaleWarning = ({reset, stale}: StaleWarningProps) => {
  return (
    <div style={{margin: '-20px', marginTop: 0}}>
      <div style={{padding: '5px 20px', backgroundColor: 'rgba(255, 255, 0, 0.5)', fontWeight: 'bold'}}>Warning</div>
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
  )
}
