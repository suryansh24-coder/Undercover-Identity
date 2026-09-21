import { describe, it, expect } from 'vitest'
import {
  generateDossier,
  securityLevelFor,
  buildIdentityFromForm,
} from '../utils/dossierGeneration'
import { generateCaseFileNumber } from '../utils/format'

describe('securityLevelFor', () => {
  it('maps level numbers to classification labels', () => {
    expect(securityLevelFor('LEVEL 03').classification).toBe('RESTRICTED')
    expect(securityLevelFor('LEVEL 06').classification).toBe('SECRET')
    expect(securityLevelFor('LEVEL 09').classification).toBe('TOP SECRET')
  })
})

describe('generateDossier', () => {
  const identity = {
    codename: 'NIGHT FOX',
    operation: 'VICE SHADOW',
    specialization: 'CYBER OPERATIONS',
    location: 'VICE CITY',
    clearanceLevel: 'LEVEL 09',
    status: 'ACTIVE',
    caseFileNumber: 'VC-8F2K-Q1LM',
  }
  const dossier = generateDossier(identity)

  it('produces a document ID in UI-XXXXXXXX format', () => {
    expect(dossier.documentId).toMatch(/^UI-[0-9A-F]{8}$/)
  })

  it('includes issuedLabel in DD MMM YYYY format', () => {
    expect(dossier.issuedLabel).toMatch(/^\d{2} [A-Z]{3} \d{4}$/)
  })

  it('inherits the correct clearance level', () => {
    expect(dossier.clearanceLevel).toBe('LEVEL 09')
    expect(dossier.securityLevel).toBe('TOP SECRET')
    expect(dossier.classification).toBe('TOP SECRET')
  })

  it('has fixed metadata fields', () => {
    expect(dossier.caseStatus).toBe('OPEN')
    expect(dossier.division).toBe('VICE CITY')
    expect(dossier.branch).toBe('INTELLIGENCE DIVISION')
  })
})

describe('buildIdentityFromForm', () => {
  it('normalizes and uppercases form values', () => {
    const form = {
      codename: 'night fox',
      operation: 'vice shadow',
      specialization: 'cyber operations',
      location: 'vice city',
      clearanceLevel: 'level 09',
      status: 'active',
      caseFileNumber: 'VC-8F2K-Q1LM',
      knownAssociates: '  marlowe  ',
      primaryVehicle: '',
      specialTrait: 'cold memory',
    }
    const identity = buildIdentityFromForm(form)
    expect(identity.codename).toBe('NIGHT FOX')
    expect(identity.specialization).toBe('CYBER OPERATIONS')
    expect(identity.knownAssociates).toBe('MARLOWE')
    expect(identity.primaryVehicle).toBeNull()
  })
})

describe('generateCaseFileNumber', () => {
  it('matches VC-XXXX-XXXX', () => {
    const value = generateCaseFileNumber()
    expect(value).toMatch(/^VC-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
  })
})