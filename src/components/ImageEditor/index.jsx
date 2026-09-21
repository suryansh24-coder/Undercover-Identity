import { Component, lazy, Suspense } from 'react'
import Icon from '../common/Icon'

/* ============================================================
   IMAGE EDITOR SLOT — the single seam between the application
   and the image editor implementation.

   Today it lazy-mounts ImageEditorPlaceholder (a working,
   in-browser editing module). In the next phase this slot will
   point at @unlayer/react-image-editor instead, and nothing else
   in the application needs to change.

   Contract:
   - props.source: data URL of the uploaded photograph
   - props.onSave(dataUrl, didChange): user finished editing
   - props.onCancel(): user wants to return to upload
   ============================================================ */

const PlaceholderEditor = lazy(() =>
  import('./ImageEditorPlaceholder').then((mod) => ({
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
          <p className="mono">The editor module failed to load. Use the controls below to retry or continue.</p>
          <button type="button" className="back-link mono" onClick={() => this.setState({ failed: false })}>
            Reload Editor
          </button>
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
  return (
    <EditorLoadingBoundary>
      <Suspense fallback={<EditorFallback />}>
        <PlaceholderEditor source={source} onSave={onSave} onCancel={onCancel} />
      </Suspense>
    </EditorLoadingBoundary>
  )
}