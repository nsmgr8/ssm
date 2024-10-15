import {LoadFile} from './load.file'
import {setupGrid} from '../stores/grid'
import {stormData} from '../stores/storm'
import {currentZetaIdx, zetas} from '../stores/zeta'
import {Card} from './card'
import {loadFile} from '../utils/file.load'

export const ZetaCard = () => {
  return (
    <Card>
      <LoadFile id="zeta-file" label="Zeta file" onChange={loadZeta} />
      <button type="button" onClick={nextZeta}>
        Next
      </button>
    </Card>
  )
}

const nextZeta = () => {
  const idx = currentZetaIdx.value + 1
  if (idx >= zetas.value.length) {
    currentZetaIdx.value = 0
  } else {
    currentZetaIdx.value = idx
  }
}

const loadZeta = loadFile({
  async onLoad(e: ProgressEvent<FileReader>) {
    const {storm, grid_params, grid, zetas: data} = JSON.parse(e.target?.result as string)
    await setupGrid(grid_params, grid)
    stormData.value = storm
    zetas.value = data
    currentZetaIdx.value = 0
  },
})
