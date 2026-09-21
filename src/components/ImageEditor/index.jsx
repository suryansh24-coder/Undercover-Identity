import { Component, lazy, Suspense, useState } from 'react'
import Icon from '../common/Icon'

/* ============================================================
   IMAGE EDITOR SLOT — the single seam between the application
   and the image editor implementation.

   Backed by the official @unlayer/react-image-editor (the lazy
   chunk below loads its CDN embed script only when this scene
   mounts). Nothing else in the application knows or cares which
   engine provides editing.

   Contract:
   - props.source: data URL of the uploaded/edited photograph
   - props.onSave(dataUrl, didChange): user finished editing
   - props.onCancel(): user wants to return to upload
   ============================================================ */

const UnlayerEditor = lazy(() =>
  import('./UnlayerEditor').then((mod) => ({
    default: mod.default,
  }))
)

class EditorLoadingBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="editor-loading editor-loading--fatal" role="alert">
          <Icon name="alert" size={18} />
          <p className="mono">The editor module failed to render. Retry the load or return to upload.</p>
          <div className="editor-fatal-actions">
            <button type="button" className="back-link mono" onClick={() => this.setState({ failed: false })}>
              Reload Editor
            </button>
            <button type="button" className="back-link mono" onClick={this.props.onReturn}>
              Return to Upload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function EditorFallback() {
  return (
    <div className="editor-loading" role="status">
      <span className="pulse" aria-hidden="true" />
      <span className="mono">MOUNTING EDITOR MODULE…</span>
    </div>
  )
}

export default function ImageEditorSlot({ source, onSave, onCancel }) {
  const [fatal, setFatal] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  const retry = () => {
    setFatal(null)
    setLoadError(false)
    setRetryKey((key) => key + 1)
  }

  if (!source) {
    return (
      <div className="editor-loading editor-loading--fatal" role="alert">
        <Icon name="alert" size={18} />
        <p className="mono">No photograph on file for this session.</p>
        <button type="button" className="back-link mono" onClick={onCancel}>
          Return to Upload
        </button>
      </div>
    )
  }

  if (fatal) {
    return (
      <div className="editor-loading editor-loading--fatal" role="alert">
        <Icon name="alert" size={18} />
        <p className="mono">{fatal}</p>
        <div className="editor-fatal-actions">
          <button type="button" className="back-link mono" onClick={retry}>
            Reload Editor
          </button>
          <button type="button" className="back-link mono" onClick={onCancel}>
            Return to Upload
          </button>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="editor-loading editor-loading--fatal" role="alert">
        <Icon name="alert" size={18} />
        <p className="mono">The photograph could not be loaded into the editor. Try the image again or upload a different photo.</p>
        <div className="editor-fatal-actions">
          <button type="button" className="back-link mono" onClick={retry}>
            Try Again
          </button>
          <button type="button" className="back-link mono" onClick={onCancel}>
            Return to Upload
          </button>
        </div>
      </div>
    )
  }

  return (
    <EditorLoadingBoundary onReturn={onCancel}>
      <Suspense fallback={<EditorFallback />}>
        <UnlayerEditor
          key={retryKey}
          source={source}
          onSave={onSave}
          onCancel={onCancel}
          onLoadError={() => setLoadError(true)}
          onError={(error) => setFatal(error && error.message ? error.message : 'The image editor failed to initialize.')}
        />
      </Suspense>
    </EditorLoadingBoundary>
  )
}