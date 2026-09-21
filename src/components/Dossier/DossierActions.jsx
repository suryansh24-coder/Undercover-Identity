import { useState } from 'react'
import { useIdentity } from '../../context/IdentityContext'
import { useOptionalSound } from '../../hooks/useOptionalSound'
import { ActionButton } from '../common/ActionButton'
import { dossierNodeToBlob, downloadBlob, dossierFilename } from '../../utils/downloadDossier'
import { copyIdentity, shareIdentity, supportsWebShare } from '../../utils/shareIdentity'

export default function DossierActions({ paperRef, identity, dossier }) {
  const { actions, state } = useIdentity()
  const play = useOptionalSound(state.soundEnabled)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!paperRef.current || downloading) return
    setDownloading(true)
    try {
      const blob = await dossierNodeToBlob(paperRef.current)
      downloadBlob(blob, dossierFilename(identity.codename))
      play('download')
      actions.notify('DOSSIER DOWNLOADED · STORE IT, OPERATIVE.', 'success')
    } catch {
      setDownloading(false)
      actions.notify(
        'The browser could not compose the dossier image. Try again, or use landscape desktop Chrome for the best result.',
        'error'
      )
      play('error')
      return
    }
    setDownloading(false)
  }

  const handleCopy = async () => {
    try {
      await copyIdentity(identity, dossier)
      play('save')
      actions.notify('IDENTITY COPIED TO CLIPBOARD.', 'success')
    } catch {
      actions.notify('Clipboard access was denied by the browser.', 'error')
      play('error')
    }
  }

  const handleShare = async () => {
    try {
      const result = await shareIdentity(identity, dossier, null)
      if (result === 'copied') {
        actions.notify('SHARE LINK + IDENTITY COPIED TO CLIPBOARD.', 'success')
      } else {
        play('save')
      }
    } catch {
      actions.notify('Sharing is unavailable in this browser. Use COPY IDENTITY instead.', 'error')
      play('error')
    }
  }

  const handleNew = () => {
    play('wipe')
    actions.reset()
  }

  return (
    <div className="dossier-actions" aria-label="Dossier export actions">
      <ActionButton
        variant="primary"
        size="lg"
        icon="download"
        magnetic
        busy={downloading}
        onClick={handleDownload}
        data-cursor="hover"
      >
        Download Dossier
      </ActionButton>
      <ActionButton variant="ghost" size="md" icon="copy" onClick={handleCopy} data-cursor="hover">
        Copy Identity
      </ActionButton>
      <ActionButton variant="ghost" size="md" icon="share" onClick={handleShare} data-cursor="hover">
        {supportsWebShare() ? 'Share' : 'Share · Copy'}
      </ActionButton>
      <ActionButton variant="crimson" size="md" icon="refresh" onClick={handleNew} data-cursor="hover">
        Create New Identity
      </ActionButton>
    </div>
  )
}