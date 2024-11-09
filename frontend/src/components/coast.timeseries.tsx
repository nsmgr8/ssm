import {EChartsOption} from 'echarts'
import {chartData, coastLevelMax, coastLevelMin, observed} from '../stores/coast'
import {gridMatrix, selectedPoint} from '../stores/grid'
import {currentStormLocation, stormLocations, stormName} from '../stores/storm'
import {RunType, runTypes} from '../stores/zeta'
import {formattedLngLat} from '../utils/formats'
import {EChart} from '@kbox-labs/react-echarts'
import {ArrayElement} from '../utils/types'
import {distance} from '@turf/turf'
import {useEffect, useState} from 'react'

const defaultName = 'PLEASE SET THE LOCATION NAME'
export const CoastTimeSeries = () => {
  const [locationName, setLocationName] = useState('')
  useEffect(() => {
    setLocationName('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPoint.value])
  const {row, column} = selectedPoint.value
  const location = formattedLngLat(gridMatrix.value[row]?.[column] || [])
  const sum = chartData.value.both.reduce((acc, [time, value]) => {
    const [_, ovalue] = observed.value.find(([otime]) => otime === time) || []
    if (ovalue !== undefined) {
      acc += (ovalue - value) ** 2
    }
    return acc
  }, 0)
  const rmse = observed.value.length > 0 ? `RMSE: ${(sum / observed.value.length).toFixed(4)}` : ''
  return (
    <>
      <div style={{padding: '10px', display: 'flex', gap: 10, justifyContent: 'center', backgroundColor: '#eee'}}>
        <label htmlFor="id-title">Location Name</label>
        <input
          size={50}
          type="text"
          value={locationName}
          onChange={({target: {value}}) => setLocationName(value)}
          placeholder="Enter location name here..."
        />
      </div>
      <div style={{position: 'relative', height: 'calc(100% - 41px)', display: 'flex', alignItems: 'center'}}>
        <EChart
          style={{
            height: '98%',
            width: '100%',
          }}
          title={{
            text: `${stormName.value} - ${locationName}`,
            subtext: locationName
              ? ''
              : `${defaultName}
Location: ${location}
Grid Point: (${row}, ${column})
${rmse}`,
            left: '50%',
            textAlign: 'center',
            itemGap: 5,
            subtextStyle: {
              fontSize: 14,
              fontWeight: 'bold',
              lineHeight: 18,
            },
          }}
          tooltip={{
            trigger: 'axis',
            formatter: (event) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const e = event as any[]
              currentStormLocation.value = stormLocations.value[e[0].dataIndex]
              const time = new Date(e[0].data[0]).toLocaleString('en-GB', {dateStyle: 'medium', timeStyle: 'short'})
              const heading = `<div style='font-weight:bold;border-bottom:1px solid #555'>${time}</div>`
              const items = e
                .map((x) => {
                  const color = `<div style='background-color:${x.color};padding:0px 5px'>&nbsp;</div>`
                  const name = `<div>${x.seriesName}</div>`
                  const key = `<div style='display:flex;gap:3px'>${color}${name}</div>`
                  const value = `<div style='font-weight:bold'>${x.data[1].toFixed(3)} m</div>`
                  return `<div style='display:flex;justify-content:space-between;gap:5px;margin:5px 0'>${key}${value}</div>`
                })
                .join('')
              const storm_dist = distance(gridMatrix.value[row][column], currentStormLocation.value)
              const storm = `<div style='border-top:1px solid #555;padding-top:3px'>
              <div>Storm at <span style='font-weight:bold'>${formattedLngLat(currentStormLocation.value)}</span></div>
              <div>Storm distance: <span style='font-weight:bold'>${storm_dist.toFixed(3)} km</span></div>
            </div>`
              return [heading, items, storm].join('')
            },
          }}
          toolbox={{
            feature: {
              dataZoom: {
                yAxisIndex: 'none',
              },
              dataView: {readOnly: false},
              saveAsImage: {},
            },
          }}
          legend={{
            show: true,
            bottom: 0,
            textStyle: {
              fontSize: '18px',
            },
          }}
          xAxis={{
            name: 'Time',
            nameLocation: 'middle',
            nameGap: 30,
            nameTextStyle: {
              fontWeight: 'bold',
              fontSize: '16px',
            },
            type: 'time',
            axisLabel: {
              fontSize: '16px',
              formatter: {
                day: '{yyyy}-{MM}-{dd}',
                hour: '{HH}:{mm}',
              },
            },
          }}
          yAxis={{
            name: 'Sea Level',
            nameLocation: 'middle',
            nameGap: 60,
            nameTextStyle: {
              fontWeight: 'bold',
              fontSize: '16px',
            },
            type: 'value',
            max: coastLevelMax.value,
            min: coastLevelMin.value,
            axisLabel: {
              fontSize: '16px',
              formatter: (value) => `${value.toFixed(2)} m`,
              showMinLabel: false,
              showMaxLabel: false,
            },
          }}
          series={[
            seriesConf('both'),
            seriesConf('surge', [5]),
            seriesConf('tide', [5, 10, 15]),
            observed.value.length > 0 && {
              name: 'observed',
              type: 'scatter',
              data: observed.value,
            },
          ]}
        />
        <Message />
      </div>
    </>
  )
}

const seriesConf = (name: RunType, type: number[] = []): ArrayElement<EChartsOption['series']> => ({
  name,
  type: 'line',
  lineStyle: {
    width: 3,
    type,
  },
  symbol: 'none',
  data: chartData.value[name],
})

const Message = () => {
  let message: string | null = null
  const {row, column} = selectedPoint.value
  if (row < 0 || column < 0) {
    message = 'Please select a coast point in the grid left after loading the result files'
  } else if (runTypes.filter((run) => chartData.value[run].length === 0).length === runTypes.length) {
    message = 'Chart data is available for coasts only'
  }
  return (
    message && (
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(200, 100, 100, 0.9)',
          fontSize: '3rem',
          textAlign: 'center',
          padding: '1.5rem',
        }}
      >
        {message}
      </div>
    )
  )
}
