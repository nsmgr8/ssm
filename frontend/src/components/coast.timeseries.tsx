import {ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Label} from 'recharts'
import {chartData, coastLevelMax, coastLevelMin, coasts} from '../stores/coast'
import {selectedPoint} from '../stores/grid'
import {Location} from './location'

export const CoastTimeSeries = () => (
  <>
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 10, fontSize: '22px'}}>
      <Title />
    </div>
    <ResponsiveContainer width="100%" height="90%">
      <LineChart
        width={500}
        height={300}
        data={chartData.value}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" tickFormatter={(d) => new Date(d).toLocaleString('en-GB', {timeStyle: 'short'})}>
          <Label value="Time" offset={0} position="bottom" />
        </XAxis>
        <YAxis domain={[coastLevelMin.value, coastLevelMax.value]} unit=" m" />
        <Tooltip labelFormatter={(d) => new Date(d).toLocaleString()} />
        <Legend verticalAlign="top" height={36} />
        <Line
          isAnimationActive={false}
          type="monotone"
          dot={false}
          dataKey="both"
          stroke="#28acd9"
          strokeWidth={3}
          activeDot={{r: 8}}
        />
        <Line
          isAnimationActive={false}
          type="monotone"
          dot={false}
          dataKey="surge"
          stroke="#8884d8"
          strokeWidth={3}
          strokeDasharray="4"
        />
        <Line
          isAnimationActive={false}
          type="monotone"
          dot={false}
          dataKey="tide"
          stroke="#82ca9d"
          strokeWidth={3}
          strokeDasharray="4 1 2"
        />
        <Line
          isAnimationActive={false}
          type="monotone"
          dot={{r: 6, fill: 'red', stroke: 'red'}}
          dataKey="observed"
          stroke="red"
        />
      </LineChart>
    </ResponsiveContainer>
  </>
)

const Title = () => {
  try {
    const {row, column} = selectedPoint.value
    let n = 0
    let sum = 0
    coasts.value[row][column].forEach(({both, observed}) => {
      if (observed !== undefined && both !== undefined) {
        n += 1
        sum += (observed - both) ** 2
      }
    })
    const rmse = sum / n
    return (
      <>
        <div>
          Location: <Location row={row} column={column} />
        </div>
        <div>
          Grid Point: {row}, {column}
        </div>
        <div>RMSE: {rmse.toFixed(2)}</div>
      </>
    )
  } catch (e) {
    console.error(e)
    return 'Please select a coast point in the grid left after loading the result files'
  }
}
