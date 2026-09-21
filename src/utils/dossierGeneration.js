import { generateDocumentId, formatIssuedDate } from './format'

const LEVEL_CLASSIFICATION = {
  2: 'RESTRICTED',
  3: 'RESTRICTED',
  4: 'RESTRICTED',
  5: 'SECRET',
  6: 'SECRET',
  7: 'SECRET',
  8: 'SECRET',
  9: 'TOP SECRET',
  10: 'TOP SECRET',
}

export function securityLevelFor(clearanceLevel) {
  const match = String(clearanceLevel || '').match(/(\d+)/)
  const num = match ? Number(match[1]) : 9
  return {
    level: Math.min(10, Math.max(1, num)),
    classification: LEVEL_CLASSIFICATION[Math.min(10, Math.max(2, num))] || 'SECRET',
  }
}

export function generateDossier(identity) {
  const { level, classification } = securityLevelFor(identity?.clearanceLevel)
  const issued = formatIssuedDate(new Date())

  return {
    documentId: generateDocumentId(),
    division: 'VICE CITY',
    branch: 'INTELLIGENCE DIVISION',
    classification,
    clearanceLevel: `LEVEL ${String(level).padStart(2, '0')}`,
    issuedDate: issued.isoDate,
    issuedLabel: `${issued.day} ${issued.month} ${issued.year}`,
    issuedTime: issued.time,
    caseStatus: 'OPEN',
    securityLevel: classification,
    clearedBy: 'DIVISION CHIEF · SECTOR 09',
    fingerprintHash: generateDocumentId().replace('UI-', 'FPR-'),
  }
}

export function buildIdentityFromForm(values) {
  const clean = (value) => String(value ?? '').trim()
  const optional = (value) => (clean(value) ? clean(value).toUpperCase() : null)
  return {
    codename: clean(values.codename).toUpperCase(),
    operation: clean(values.operation).toUpperCase(),
    specialization: clean(values.specialization).toUpperCase(),
    location: clean(values.location).toUpperCase(),
    clearanceLevel: clean(values.clearanceLevel).toUpperCase(),
    status: clean(values.status).toUpperCase(),
    caseFileNumber: clean(values.caseFileNumber).toUpperCase(),
    knownAssociates: optional(values.knownAssociates),
    primaryVehicle: optional(values.primaryVehicle),
    specialTrait: optional(values.specialTrait),
  }
}

export function identityToText(identity, dossier) {
  const lines = [
    'UNDERCOVER IDENTITY — CLASSIFIED DOSSIER',
    '-----------------------------------------',
    `CODENAME:        ${identity.codename}`,
    `OPERATION:       ${identity.operation}`,
    `SPECIALIZATION:  ${identity.specialization}`,
    `LOCATION:        ${identity.location}`,
    `CLEARANCE:       ${identity.clearanceLevel}`,
    `STATUS:          ${identity.status}`,
    `CASE FILE:       ${identity.caseFileNumber}`,
    '-----------------------------------------',
    `DOCUMENT:        ${dossier?.documentId ?? ''}`,
    `CLASSIFICATION:  ${dossier?.classification ?? 'TOP SECRET'}`,
    `ISSUED:          ${dossier?.issuedLabel ?? ''}`,
  ]
  if (identity.knownAssociates) lines.push(`ASSOCIATES:      ${identity.knownAssociates}`)
  if (identity.primaryVehicle) lines.push(`VEHICLE:         ${identity.primaryVehicle}`)
  if (identity.specialTrait) lines.push(`TRAIT:           ${identity.specialTrait}`)
  lines.push('', 'YOUR IDENTITY IS CLASSIFIED. — Undercover Identity')
  return lines.join('\n')
}