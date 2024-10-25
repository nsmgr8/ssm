import {chartData, coastLevelMax, coastLevelMin, observed} from '../stores/coast'
import {gridMatrix, selectedPoint} from '../stores/grid'
import {stormData, stormName} from '../stores/storm'
import {runTypes} from '../stores/zeta'
import {formattedLngLat} from '../utils/formats'
import {EChart} from '@kbox-labs/react-echarts'

export const CoastTimeSeries = () => {
  const {row, column} = selectedPoint.value
  const [lng, lat] = gridMatrix.value[row]?.[column] || []
  const location = formattedLngLat(lng, lat)
  const sum = chartData.value.both.reduce((acc, [time, value]) => {
    const [_, ovalue] = observed.value.find(([otime]) => otime === time) || []
    if (ovalue !== undefined) {
      acc += (ovalue - value) ** 2
    }
    return acc
  }, 0)
  const rmse = observed.value.length > 0 ? `RMSE: ${(sum / observed.value.length).toFixed(4)}` : ''
  return (
    <div style={{position: 'relative', height: '100%', display: 'flex', alignItems: 'center'}}>
      <EChart
        style={{
          height: '98%',
          width: '100%',
        }}
        title={{
          text: `${stormName.value}`,
          subtext: `Location: ${location}
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
          valueFormatter: (x) => (x !== undefined ? `${(+x).toFixed(2)} m` : ''),
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
            formatter: {
              day: '{yyyy}-{MM}-{dd}',
              hour: '{HH}:{mm}',
            },
          },
        }}
        yAxis={{
          name: 'Sea Level',
          nameLocation: 'middle',
          nameGap: 50,
          nameTextStyle: {
            fontWeight: 'bold',
            fontSize: '16px',
          },
          type: 'value',
          max: coastLevelMax.value,
          min: coastLevelMin.value,
          axisLabel: {
            formatter: (value) => `${value.toFixed(2)} m`,
          },
        }}
        series={[
          {
            name: 'both',
            type: 'line',
            lineStyle: {
              width: 3,
            },
            symbol: 'none',
            data: chartData.value.both,
          },
          {
            name: 'surge',
            type: 'line',
            lineStyle: {
              width: 3,
              type: [10],
            },
            symbol: 'none',
            data: chartData.value.surge,
          },
          {
            name: 'tide',
            type: 'line',
            lineStyle: {
              width: 3,
              type: [5, 10, 15],
            },
            symbol: 'none',
            data: chartData.value.tide,
          },
          {
            name: 'observed',
            type: 'scatter',
            data: observed.value,
          },
        ]}
      />
      <Title />
    </div>
  )
}

const Title = () => {
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
