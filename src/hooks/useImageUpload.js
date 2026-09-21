import { useCallback, useRef, useState } from 'react'
import {
  validateImageFile,
  createImagePreview,
  MAX_FILE_BYTES,
} from '../utils/imageValidation'

export function useImageUpload() {
  const [state, setState] = useState({
    fileName: null,
    fileSize: null,
    dataUrl: null,
    width: null,
    height: null,
    validating: false,
    error: null,
  })

  const processing = useRef(false)

  const acceptFile = useCallback(async (file) => {
    if (processing.current) return
    if (!file) {
      setState((s) => ({ ...s, error: 'No file selected.' }))
      return { ok: false }
    }

    const check = validateImageFile(file)
    if (!check.ok) {
      setState((s) => ({
        ...s,
        error: check.message,
        dataUrl: null,
        fileName: null,
        fileSize: null,
        width: null,
        height: null,
      }))
      return { ok: false, error: check.message }
    }

    processing.current = true
    setState((s) => ({ ...s, validating: true, error: null }))
    try {
      const preview = await createImagePreview(file)
      setState({
        fileName: file.name,
        fileSize: file.size,
        dataUrl: preview.dataUrl,
        width: preview.width,
        height: preview.height,
        validating: false,
        error: null,
      })
      return { ok: true, image: preview }
    } catch {
      setState((s) => ({
        ...s,
        validating: false,
        error: 'That image could not be processed. Try a different JPG, PNG, or WEBP file.',
        dataUrl: null,
        fileName: null,
        fileSize: null,
        width: null,
        height: null,
      }))
      return { ok: false, error: 'The image could not be processed.' }
    } finally {
      processing.current = false
    }
  }, [])

  const clear = useCallback(() => {
    setState({
      fileName: null,
      fileSize: null,
      dataUrl: null,
      width: null,
      height: null,
      validating: false,
      error: null,
    })
  }, [])

  return { ...state, maxBytes: MAX_FILE_BYTES, acceptFile, clear }
}