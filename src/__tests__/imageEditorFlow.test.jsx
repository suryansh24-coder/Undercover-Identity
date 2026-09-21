import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from '../App'

const ORIGINAL_DATA_URL = 'data:image/png;base64,ORIGINALUPLOAD'
const EDITED_DATA_URL = 'data:image/png;base64,EDITEDRESULT42'

vi.mock('../components/BackgroundEffects', () => ({
  default: () => null,
}))

let editorProps

vi.mock('../components/ImageEditor/UnlayerEditor', () => ({
  default: function FakeUnlayer(props) {
    editorProps = props
    return (
      <div data-testid="unlayer-mount">
        <span>FAKE UNLAYER EDITOR</span>
        <span data-testid="unlayer-source">{props.source}</span>
        <button type="button" onClick={() => props.onSave(EDITED_DATA_URL, true)}>
          Save Edited
        </button>
        <button type="button" onClick={props.onCancel}>
          Cancel Edit
        </button>
      </div>
    )
  },
}))

vi.mock('../utils/imageValidation', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    createImagePreview: async () => ({ dataUrl: ORIGINAL_DATA_URL, width: 640, height: 480 }),
  }
})

describe('image editor flow → dossier', () => {
  it('passes the uploaded image to the editor and the edited image reaches the dossier', async () => {
    const user = userEvent.setup()
    render(<App />)

    await screen.findByRole('button', { name: 'Enter System' }, { timeout: 5000 })
    await user.click(screen.getByRole('button', { name: 'Enter System' }))

    const begin = await screen.findByRole('button', { name: 'Begin Operation' }, { timeout: 8000 })
    await waitFor(() => expect(begin).not.toBeDisabled(), { timeout: 9000 })
    await user.click(begin)

    const input = document.querySelector('input[type="file"]')
    expect(input).not.toBeNull()
    const file = new File(['fake-png-bytes'], 'photo.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })

    const continueBtn = await screen.findByRole('button', { name: 'Continue' }, { timeout: 5000 })
    await user.click(continueBtn)

    const saveBtn = await screen.findByRole('button', { name: 'Save Edited' }, { timeout: 5000 })
    expect(editorProps).toBeDefined()
    expect(editorProps.source).toBe(ORIGINAL_DATA_URL)
    expect(typeof editorProps.onSave).toBe('function')
    expect(typeof editorProps.onCancel).toBe('function')
    expect(typeof editorProps.onLoadError).toBe('function')
    expect(typeof editorProps.onError).toBe('function')

    await user.click(saveBtn)

    await user.type(screen.getByLabelText('Codename'), 'NIGHTFOX')
    await user.type(screen.getByLabelText('Operation'), 'VICE SHADOW')
    await user.type(screen.getByLabelText('Specialization'), 'CYBER OPS')
    await user.click(screen.getByRole('button', { name: 'Classify Identity' }))

    const photo = await screen.findByAltText(
      'Official subject photograph for operative NIGHTFOX',
      {},
      { timeout: 15000 }
    )
    expect(photo).toHaveAttribute('src', EDITED_DATA_URL)
    expect(photo.getAttribute('src')).not.toBe(ORIGINAL_DATA_URL)
    expect(screen.getAllByText('NIGHTFOX').length).toBeGreaterThan(0)
  }, 45000)
})