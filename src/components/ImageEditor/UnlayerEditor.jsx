import ImageEditor from '@unlayer/react-image-editor'
import { Scene } from '../common/Scene'
import { ActionButton } from '../common/ActionButton'

/**
 * Unlayer-backed editor scene. Renders the same chrome as the editor it
 * replaces (step header + return action) around the official
 * @unlayer/react-image-editor host, keeping the visual experience intact.
 */
export default function UnlayerEditor({ source, onSave, onCancel, onLoadError, onError }) {
  return (
    <Scene className="editor-scene" label="Step two of three — edit your photograph">
      <div className="editor-head">
        <div>
          <p className="system-label mono micro gold">STEP 02 / 03 · IMAGE LAB</p>
          <h1 className="editor-title">Modify Your Photograph</h1>
          <p className="editor-sub mono micro muted">
            Crop · tone · frame — the finished image feeds your classified dossier.
          </p>
        </div>
        <div className="editor-head-actions">
          <ActionButton variant="ghost" size="md" icon="chevronL" magnetic onClick={onCancel}>
            Return
          </ActionButton>
        </div>
      </div>

      <div className="editor-unlayer-wrap" data-export-skip>
        <ImageEditor
          image={source}
          options={{
            theme: 'dark',
          }}
          minHeight={560}
          style={{ width: '100%', minHeight: 'min(72vh, 680px)' }}
          onSave={({ dataUrl }) => onSave(dataUrl, true)}
          onCancel={onCancel}
          onLoadError={onLoadError}
          onError={onError}
        />
      </div>
    </Scene>
  )
}