import { Component } from 'react'
import { IdentityProvider, useIdentity } from './context/IdentityContext'
import BackgroundEffects from './components/BackgroundEffects'
import CustomCursor from './components/CustomCursor'
import SystemMeta from './components/SystemMeta'
import Navigation from './components/Navigation'
import TransitionOverlay from './components/TransitionOverlay'
import { Toast } from './components/common/Toast'
import Landing from './components/Landing'
import SecurityClearance from './components/SecurityClearance'
import PhotoUpload from './components/PhotoUpload'
import ImageEditorSlot from './components/ImageEditor'
import IdentityForm from './components/IdentityForm'
import DecryptionSequence from './components/DecryptionSequence'
import Dossier from './components/Dossier'

class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  handleReset = () => {
    this.setState({ failed: false })
    window.location.hash = ''
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="error-boundary" role="alert">
          <p className="mono gold micro">SYSTEM FAULT</p>
          <h1 className="error-boundary-title">SESSION INTERRUPTED</h1>
          <p className="mono muted micro">An unexpected error was contained. No data left this device.</p>
          <button type="button" className="btn btn--primary btn--md" onClick={this.handleReset}>
            Reload Session
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function EditorScene() {
  const { state, actions } = useIdentity()
  const source = state.editedImage || state.uploadedImage?.dataUrl

  if (!source) {
    return (
      <div className="editor-loading editor-loading--fatal" role="alert">
        <p className="mono">No photograph on file for this session.</p>
        <button type="button" className="back-link mono" onClick={() => actions.go('upload')}>
          Return to Upload
        </button>
      </div>
    )
  }

  return (
    <ImageEditorSlot
      source={source}
      onSave={(dataUrl, changed) => {
        actions.setEdited(dataUrl, changed)
        actions.go('identity')
      }}
      onCancel={() => actions.go('upload')}
    />
  )
}

function SceneRouter() {
  const { state } = useIdentity()
  switch (state.step) {
    case 'landing':
      return <Landing />
    case 'security':
      return <SecurityClearance />
    case 'upload':
      return <PhotoUpload />
    case 'editor':
      return <EditorScene />
    case 'identity':
      return <IdentityForm />
    case 'decrypt':
      return <DecryptBridge />
    case 'dossier':
      return <Dossier />
    default:
      return <Landing />
  }
}

function DecryptBridge() {
  const { actions } = useIdentity()
  return <DecryptionSequence onComplete={() => actions.go('dossier')} />
}

function Shell() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <BackgroundEffects />
      <CustomCursor />
      <Navigation />
      <main id="main" className="stage">
        <SceneRouter />
      </main>
      <SystemMeta />
      <Toast />
      <TransitionOverlay />
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <IdentityProvider>
        <Shell />
      </IdentityProvider>
    </ErrorBoundary>
  )
}