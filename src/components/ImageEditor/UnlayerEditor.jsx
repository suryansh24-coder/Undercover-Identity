import { useEffect, useRef, useState } from 'react'
import ImageEditor from '@unlayer/react-image-editor'
import { Scene } from '../common/Scene'
import { ActionButton } from '../common/ActionButton'
import Icon from '../common/Icon'

const SAVE_HOLD_MS = 1500

/**
 * Unlayer-backed editor scene. Renders the IDENTITY MODIFICATION TERMINAL
 * chrome (step header, source → cover pipeline label, and classification
 * status) around the official @unlayer/react-image-editor host.
 *
 * When the operative saves, the host surface is covered by a brief
 * "modification complete" frame before the edited image is committed to the
 * session — the edited canvas genuinely passes through the real editor.
 */
export default function UnlayerEditor({ source, onSave, onCancel, onLoadError, onError }) {
  const onSaveRef = useRef(onSave)
  const completeTimerRef = useRef(null)
  const savingRef = useRef(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  useEffect(() => {
    return () => {
      if (completeTimerRef.current) {
        window.clearTimeout(completeTimerRef.current)
        completeTimerRef.current = null
      }
    }
  }, [])

  const handleSave = ({ dataUrl }) => {
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setSaved(true)
    completeTimerRef.current = window.setTimeout(
      () => {
        onSaveRef.current(dataUrl, true)
        completeTimerRef.current = null
      },
      SAVE_HOLD_MS
    )
  }

  return (
    <Scene className="editor-scene" label="Step two of three — identity modification terminal">
      <div className="editor-head">
        <div>
          <p className="system-label mono micro gold">STEP 02 / 03 · IDENTITY MODIFICATION</p>
          <h1 className="editor-title">Identity Modification</h1>
          <p className="editor-sub mono micro muted">
            The intelligence network needs a new visual identity. Modify the source
            photograph — the finished image becomes your classified cover.
          </p>
        </div>
        <div className="editor-head-actions">
          <ActionButton variant="ghost" size="md" icon="chevronL" magnetic disabled={saving} onClick={onCancel}>
            Return
          </ActionButton>
        </div>
      </div>

      <div className="editor-pipeline" aria-label="Identity modification pipeline">
        <div className={`editor-pipeline-cell ${saved ? 'is-passed' : 'is-active'}`}>
          <span className="editor-pipeline-icon">
            <Icon name="image" size={14} />
          </span>
          <span className="editor-pipeline-label mono">SOURCE IMAGE</span>
          <span className="editor-pipeline-state mono">{saved ? 'MODIFIED' : 'UPLOADED'}</span>
        </div>
        <span className="editor-pipeline-arrow" aria-hidden="true">
          <Icon name="arrowR" size={14} />
        </span>
        <div className="editor-pipeline-cell is-center">
          <span className="editor-pipeline-icon">
            <Icon name="pen" size={14} />
          </span>
          <span className="editor-pipeline-label mono">COVER IDENTITY</span>
          <span className="editor-pipeline-state mono">{saved ? 'GENERATED' : 'IN PROGRESS'}</span>
        </div>
        <span className="editor-pipeline-arrow" aria-hidden="true">
          <Icon name="arrowR" size={14} />
        </span>
        <div className={`editor-pipeline-cell ${saved ? 'is-verified' : ''}`}>
          <span className="editor-pipeline-icon">
            <Icon name="shield" size={14} />
          </span>
          <span className="editor-pipeline-label mono">CLASSIFICATION</span>
          <span className={`editor-pipeline-state mono ${saved ? 'gold' : ''}`}>
            {saved ? 'INTEGRITY VERIFIED' : 'UNVERIFIED'}
          </span>
        </div>
        <div className={`editor-pipeline-badge ${saved ? 'is-verified' : ''}`}>
          <span className="editor-pipeline-badge-dot" aria-hidden="true" />
          <span className="mono">{saved ? 'IMAGE INTEGRITY VERIFIED' : 'CLASSIFICATION: UNVERIFIED'}</span>
        </div>
      </div>

      <div className="editor-unlayer-wrap" data-export-skip>
        <ImageEditor
          image={source}
          options={{
            theme: 'dark',
            features: {
              imageEditor: {
                dock: 'right',
              },
            },
          }}
          minHeight={540}
          style={{ width: '100%', minHeight: 'min(68vh, 640px)' }}
          onSave={handleSave}
          onCancel={onCancel}
          onLoadError={onLoadError}
          onError={onError}
        />
      </div>

      {saved ? (
        <div className="editor-save-frame" role="status" aria-live="polite">
          <div className="editor-save-scan" aria-hidden="true" />
          <div className="editor-save-core">
            <p className="editor-save-kicker mono gold">IMAGE MODIFICATION COMPLETE</p>
            <p className="editor-save-line">
              <Icon name="checkCircle" size={16} /> IMAGE INTEGRITY VERIFIED
            </p>
            <p className="editor-save-line">
              <Icon name="checkCircle" size={16} /> COVER IDENTITY GENERATED
            </p>
            <div className="editor-save-match">
              <p className="editor-save-match-value mono">
                97.4<span className="editor-save-match-pct">%</span>
              </p>
              <p className="editor-save-match-label mono micro">SIMULATED IDENTITY MATCH</p>
            </div>
            <p className="editor-save-committing mono micro muted">COMMITTING EDITED IMAGE…</p>
          </div>
        </div>
      ) : null}
    </Scene>
  )
}