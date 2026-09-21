import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

import '@fontsource/anton/400.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/cormorant-garamond/500.css'

import './styles/tokens.css'
import './styles/global.css'
import './styles/background.css'
import './styles/ui.css'
import './styles/scenes.css'
import './styles/editor.css'
import './styles/dossier.css'

document.documentElement.classList.add('js')

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}