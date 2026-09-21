export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    textarea.remove()
    return copied
  } catch {
    return false
  }
}

export async function copyIdentity(identity, dossier) {
  const body = `${identity.codename} · UNDERCOVER OPERATIVE
OPERATION: ${identity.operation}
LOCATION: ${identity.location}
CLEARANCE: ${identity.clearanceLevel}
CASE FILE: ${identity.caseFileNumber}
CLASSIFIED · ${dossier?.classification ?? 'TOP SECRET'} · Your identity is classified.`
  const ok = await copyText(body)
  if (!ok) {
    throw new Error('Clipboard access was denied by the browser.')
  }
  return true
}

export async function shareIdentity(identity, dossier, blob) {
  const text = `UNDERCOVER IDENTITY — ${identity.codename}
OPERATION: ${identity.operation} · ${identity.specialization}
LOCATION: ${identity.location} · ${identity.clearanceLevel} · ${identity.status}
CASE FILE: ${identity.caseFileNumber} — CLASSIFIED`

  const base = {
    title: `Undercover Identity — ${identity.codename}`,
    text,
    url: window.location.href,
  }

  if (typeof navigator.share === 'function') {
    const payload = typeof navigator.canShare === 'function' && blob && navigator.canShare({ files: [blob] })
      ? { ...base, files: [blob] }
      : base
    await navigator.share(payload)
    return 'shared'
  }

  if ('share' in navigator) {
    throw new Error('The device blocked the share dialog. Try copying instead.')
  }

  const ok = await copyText(`${text}\n${window.location.href}`)
  if (!ok) throw new Error('Sharing is unavailable here. Try downloading the dossier instead.')
  return 'copied'
}

export function supportsWebShare() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}