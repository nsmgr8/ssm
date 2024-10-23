import {PointSelectionMode} from './point.selection.mode'
import {StormLoader} from './storm.loader'
import {UVZToggle} from './uvz.toggle'
import {GridConfigForm} from './grid.config.form'
import {RunProgram} from './run.program'
import {Card} from './card'

export const ConfigCard = () => {
  return (
    <Card>
      <GridConfigForm />
      <PointSelectionMode />
      <StormLoader />
      <UVZToggle />
      <RunProgram />
    </Card>
  )
}
