const RULES = {
  codename: {
    required: true,
    min: 2,
    max: 24,
    pattern: /^[A-Za-z0-9][A-Za-z0-9 .'-]{1,23}$/,
    message: 'Requires 2–24 characters (letters, numbers, spaces, dots, apostrophes, hyphens).',
  },
  operation: {
    required: true,
    min: 2,
    max: 40,
    message: 'Requires 2–40 characters.',
  },
  specialization: {
    required: true,
    min: 2,
    max: 40,
    message: 'Specify a specialization (2–40 characters).',
  },
  location: {
    required: true,
    min: 2,
    max: 60,
    message: 'Select or enter an operating location.',
  },
  clearanceLevel: {
    required: true,
    pattern: /^LEVEL\s?\d{1,2}$/i,
    message: 'Select a clearance level (LEVEL 01–10).',
  },
  status: {
    required: true,
    enum: ['ACTIVE', 'CONDITIONAL', 'STANDBY'],
    message: 'Select an operative status.',
  },
  caseFileNumber: {
    required: true,
    pattern: /^[A-Za-z]{2}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/,
    message: 'Must follow VC-XXXX-XXXX format.',
  },
  knownAssociates: { max: 120, message: 'Maximum 120 characters.' },
  primaryVehicle: { max: 60, message: 'Maximum 60 characters.' },
  specialTrait: { max: 80, message: 'Maximum 80 characters.' },
}

export function validateField(name, value) {
  const rule = RULES[name]
  if (!rule) return null
  const text = String(value ?? '').trim()

  if (rule.required && !text) {
    return rule.message || `${name} is required.`
  }
  if (rule.max && text.length > rule.max) {
    return rule.message || `Maximum ${rule.max} characters.`
  }
  if (!rule.required && !text) return null
  if (rule.min && text.length < rule.min) {
    return rule.message || `Minimum ${rule.min} characters.`
  }
  if (rule.pattern && !rule.pattern.test(text)) {
    return rule.message || 'Format error.'
  }
  if (rule.enum && !rule.enum.includes(text.toUpperCase())) {
    return rule.message || 'Invalid selection.'
  }
  return null
}

export function validateIdentity(values = {}) {
  const errors = {}
  for (const name of Object.keys(RULES)) {
    const message = validateField(name, values[name])
    if (message) errors[name] = message
  }
  return errors
}

export function hasIdentityErrors(errors) {
  return Object.keys(errors).length > 0
}