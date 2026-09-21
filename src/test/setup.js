import '@testing-library/jest-dom/vitest'

const noop = () => {}

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: noop,
    removeListener: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false,
  })
}

if (typeof URL !== 'undefined' && !URL.createObjectURL) {
  URL.createObjectURL = noop
  URL.revokeObjectURL = noop
}