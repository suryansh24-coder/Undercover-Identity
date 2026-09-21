import { describe, it, expect } from 'vitest'
import {
  validateIdentity,
  validateField,
  hasIdentityErrors,
} from '../utils/identityValidation'

const VALID = {
  codename: 'NIGHT FOX',
  operation: 'VICE SHADOW',
  specialization: 'CYBER OPERATIONS',
  location: 'VICE CITY',
  clearanceLevel: 'LEVEL 09',
  status: 'ACTIVE',
  caseFileNumber: 'VC-8F2K-Q1LM',
  knownAssociates: '',
  primaryVehicle: '',
  specialTrait: '',
}

describe('identity validation', () => {
  it('accepts a complete valid identity', () => {
    expect(hasIdentityErrors(validateIdentity(VALID))).toBe(false)
  })

  it('flags missing codename', () => {
    const errors = validateIdentity({ ...VALID, codename: '' })
    expect(errors.codename).toBeTruthy()
  })

  it('flags codename out of length / character range', () => {
    expect(validateField('codename', 'A')).toBeTruthy()
    expect(validateField('codename', 'X'.repeat(30))).toBeTruthy()
    expect(validateField('codename', 'NIGHT_FOX!')).toBeTruthy()
  })

  it('flags invalid status enum', () => {
    const errors = validateIdentity({ ...VALID, status: 'RETIRED' })
    expect(errors.status).toBeTruthy()
  })

  it('flags a malformed case file number', () => {
    const errors = validateIdentity({ ...VALID, caseFileNumber: 'nope' })
    expect(errors.caseFileNumber).toBeTruthy()
  })

  it('accepts optional fields when empty', () => {
    const errors = validateIdentity(VALID)
    expect(errors.knownAssociates).toBeUndefined()
    expect(errors.primaryVehicle).toBeUndefined()
    expect(errors.specialTrait).toBeUndefined()
  })

  it('flags optional fields that exceed limits', () => {
    expect(validateField('knownAssociates', 'X'.repeat(121))).toBeTruthy()
    expect(validateField('primaryVehicle', 'X'.repeat(61))).toBeTruthy()
  })

  it('tolerates lowercase input due to trimming/uppercasing', () => {
    const errors = validateIdentity({ ...VALID, status: 'active', clearanceLevel: 'level 09' })
    expect(errors.status).toBeUndefined()
    expect(errors.clearanceLevel).toBeUndefined()
  })
})