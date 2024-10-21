import {ChangeEvent} from 'react'

type LoadFileParams = {
  init?: () => void
  onLoad: (e: ProgressEvent<FileReader>, idx: number) => Promise<void>
}
export const loadFile =
  ({init, onLoad}: LoadFileParams) =>
  ({target}: ChangeEvent<HTMLInputElement>) => {
    const {files} = target
    if (!files?.length) return

    init?.()

    const readFile = (idx: number) => {
      if (idx >= files.length) {
        target.value = ''
        return
      }
      const reader = new FileReader()
      reader.onload = async (e) => {
        await onLoad(e, idx)
        readFile(idx + 1)
      }
      reader.readAsText(files[idx])
    }

    readFile(0)
  }
