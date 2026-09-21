import { useRef, useState } from 'react'
import { useIdentity } from '../../context/IdentityContext'
import { useOptionalSound } from '../../hooks/useOptionalSound'
import { useImageUpload } from '../../hooks/useImageUpload'
import { Scene, Reveal, SectionMeta, TerminalCard } from '../common/Scene'
import { ActionButton } from '../common/ActionButton'
import { Stepper } from '../common/Stepper'
import Icon from '../common/Icon'
import { formatBytes } from '../../utils/format'

const STEPS = [
  { key: 'upload', index: '01', label: 'Photograph' },
  { key: 'editor', index: '02', label: 'Modify' },
  { key: 'identity', index: '03', label: 'Cover' },
]

export default function PhotoUpload() {
  const { actions, state } = useIdentity()
  const upload = useImageUpload()
  const play = useOptionalSound(state.soundEnabled)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const openPicker = () => {
    play('click')
    inputRef.current?.click()
  }

  const onDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer?.files?.[0]
    upload.acceptFile(file)
  }

  const continueNext = () => {
    if (!upload.dataUrl || upload.validating || upload.error) return
    play('click')
    actions.setUpload({
      dataUrl: upload.dataUrl,
      width: upload.width,
      height: upload.height,
      name: upload.fileName,
      size: upload.fileSize,
    })
    actions.setEdited(upload.dataUrl, false)
    actions.go('editor')
  }

  const picker = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      className="sr-only"
      onChange={(event) => {
        const file = event.target.files?.[0]
        if (file) upload.acceptFile(file)
        event.target.value = ''
      }}
      tabIndex={-1}
      aria-hidden="true"
    />
  )

  return (
    <Scene className="upload" label="Step one of three — upload your identity photograph">
      <div className="scene-tools">
        <button
          type="button"
          className="back-link"
          data-cursor="hover"
          onClick={() => actions.go('security')}
        >
          <Icon name="chevronL" size={14} /> Return
        </button>
      </div>

      <div className="step-container">
        <Reveal>
          <div className="step-stepper">
            <Stepper steps={STEPS} current={0} />
          </div>
        </Reveal>

        <Reveal delay={80}>
          <SectionMeta
            index="STEP 01 / 03"
            title="Identity Photograph"
            sub="Upload the photograph that will become part of your undercover identity."
          />
        </Reveal>

        <Reveal delay={180}>
          {!upload.dataUrl || !!upload.error ? (
            <TerminalCard title="Subject Photo Intake" className="upload-card">
              {picker}
              <div
                className={`dropzone ${dragging ? 'is-dragging' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                role="button"
                tabIndex={0}
                onClick={openPicker}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openPicker()
                  }
                }}
                aria-label="Upload an identity photograph. JPG, PNG, or WEBP, up to 12 MB."
              >
                <div className="dropzone-visual" aria-hidden="true">
                  <Icon name="image" size={34} />
                </div>
                <p className="dropzone-title">DRAG PHOTOGRAPH HERE</p>
                <p className="dropzone-sub mono">OR</p>
                <ActionButton variant="goldline" size="md" icon="upload" onClick={(event) => event.stopPropagation()}>
                  Select Image
                </ActionButton>
                <p className="dropzone-types mono">
                  JPG · PNG · WEBP — MAX {formatBytes(upload.maxBytes)} · PROCESSED LOCALLY
                </p>
              </div>

              <div aria-live="polite" className="upload-status-zone">
                {upload.validating ? (
                  <p className="dropzone-busy mono">
                    <span className="pulse" aria-hidden="true" /> DECODING IMAGE…
                  </p>
                ) : null}
                {upload.error ? (
                  <p className="dropzone-error mono" role="alert">
                    <Icon name="alert" size={13} /> {upload.error}
                  </p>
                ) : null}
              </div>
            </TerminalCard>
          ) : (
            <TerminalCard title="Subject Photo · Review" className="upload-card upload-preview-card">
              {picker}
              <div className="upload-preview">
                <div className="upload-preview-media">
                  <img src={upload.dataUrl} alt="Preview of the selected identity photograph" />
                  <div className="upload-preview-scan" aria-hidden="true" />
                  <span className="upload-preview-stamp mono">CAPTURED · SECTOR 09</span>
                </div>
                <div className="upload-preview-meta mono">
                  <p className="upload-preview-name">{upload.fileName}</p>
                  <div className="upload-preview-stats" aria-label="Selected file details">
                    <span>{formatBytes(upload.fileSize)}</span>
                    <span>
                      {upload.width} × {upload.height}
                    </span>
                    <span className="gold">
                      <Icon name="checkCircle" size={12} /> DECODED
                    </span>
                  </div>
                </div>
              </div>
              <div className="upload-actions">
                <ActionButton variant="ghost" size="md" icon="refresh" onClick={openPicker}>
                  Change Image
                </ActionButton>
                <ActionButton
                  variant="primary"
                  size="lg"
                  icon="arrowR"
                  magnetic
                  onClick={continueNext}
                  disabled={upload.validating}
                >
                  Continue
                </ActionButton>
              </div>
            </TerminalCard>
          )}
        </Reveal>
      </div>
    </Scene>
  )
}