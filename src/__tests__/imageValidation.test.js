import { describe, it, expect } from 'vitest'
import { validateImageFile, MAX_FILE_BYTES } from '../utils/imageValidation'
import { formatBytes } from '../utils/format'

function fakeFile(name, type, size) {
  return Object.create(File.prototype, {
    name: { value: name, configurable: true },
    type: { value: type, configurable: true },
    size: { value: size, configurable: true },
  })
}

describe('validateImageFile', () => {
  it('accepts jpg / png / webp', () => {
    expect(validateImageFile(fakeFile('a.jpg', 'image/jpeg', 1024)).ok).toBe(true)
    expect(validateImageFile(fakeFile('a.png', 'image/png', 1024)).ok).toBe(true)
    expect(validateImageFile(fakeFile('a.webp', 'image/webp', 1024)).ok).toBe(true)
  })

  it('rejects non-image types', () => {
    const result = validateImageFile(fakeFile('doc.pdf', 'application/pdf', 1024))
    expect(result.ok).toBe(false)
    expect(result.code).toBe('type')
    expect(result.message).toMatch(/JPG, PNG, or WEBP/i)
  })

  it('rejects oversized files with a friendly byte message', () => {
    const result = validateImageFile(fakeFile('big.jpg', 'image/jpeg', MAX_FILE_BYTES + 1))
    expect(result.ok).toBe(false)
    expect(result.code).toBe('size')
    expect(result.message).toMatch(new RegExp(formatBytes(MAX_FILE_BYTES).replace(' ', '\\s')))
  })

  it('rejects missing input', () => {
    const result = validateImageFile(null)
    expect(result.ok).toBe(false)
    expect(result.code).toBe('no-file')
  })

  it('accepts files at exactly the limit', () => {
    expect(validateImageFile(fakeFile('exact.jpg', 'image/jpeg', MAX_FILE_BYTES)).ok).toBe(true)
  })
})

describe('formatBytes', () => {
  it('formats bytes, KB and MB', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
  })
})