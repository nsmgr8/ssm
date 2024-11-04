import {useEffect, useRef} from 'react'
import {formatMilliseconds} from '../utils/formats'

export type ProgressState = {
  name: 'Both' | 'Surge' | 'Tide'
  storm: string
  current: number
  total: number
  state: 'running' | 'completed'
}

type ProgressProps = {
  data: ProgressState
  color: string
}
type ProgressTime = {
  elapsed: number
  iteration: number
  remaining: number
}

export const ProgressBar = ({data, color}: ProgressProps) => {
  const prevValue = useRef<ProgressTime>()
  useEffect(() => {
    const prev = prevValue.current
    if (prev?.iteration === data.current) return
    const now = +new Date()
    const timeDiff = prev?.elapsed ? now - prev.elapsed : 0
    const iterDiff = prev?.iteration ? data.current - prev.iteration : -1
    const remaining = ((data.total - data.current) * timeDiff) / iterDiff
    prevValue.current = {elapsed: now, iteration: data.current, remaining}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevValue.current, data])
  if (!data.name) return null
  const nDigits = Math.ceil(Math.log10(data.total))
  return (
    <>
      <div>{data.name}</div>
      <div style={{width: '100%', backgroundColor: '#aaa'}}>
        <div style={{width: `${(data.current / data.total) * 100}%`, backgroundColor: color}}>&nbsp;</div>
      </div>
      <div>
        {data.current.toString().padStart(nDigits, '0')}/{data.total}
      </div>
      <div style={{textWrap: 'nowrap'}}>
        {prevValue.current?.remaining ? formatMilliseconds(prevValue.current.remaining) : '--:--:--'}
      </div>
    </>
  )
}
