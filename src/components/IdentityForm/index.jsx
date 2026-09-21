import { useMemo, useState } from 'react'
import { useIdentity } from '../../context/IdentityContext'
import { useOptionalSound } from '../../hooks/useOptionalSound'
import { Scene, Reveal, SectionMeta, TerminalCard } from '../common/Scene'
import { ActionButton } from '../common/ActionButton'
import { Stepper } from '../common/Stepper'
import Icon from '../common/Icon'
import { validateIdentity, hasIdentityErrors } from '../../utils/identityValidation'
import { generateCaseFileNumber } from '../../utils/format'
import { buildIdentityFromForm, generateDossier } from '../../utils/dossierGeneration'
import { LOCATIONS, SPECIALIZATIONS, CLEARANCE_LEVELS, OPERATIVE_STATUSES } from '../../data/coverDetails'

const STEPS = [
  { key: 'upload', index: '01', label: 'Photograph' },
  { key: 'editor', index: '02', label: 'Modify' },
  { key: 'identity', index: '03', label: 'Cover' },
]

const CASE_FILE_INDEX = 'caseFileNumber'

export default function IdentityForm() {
  const { actions, state } = useIdentity()
  const play = useOptionalSound(state.soundEnabled)

  const initial = useMemo(
    () => ({
      codename: '',
      operation: '',
      specialization: '',
      location: 'VICE CITY',
      clearanceLevel: 'LEVEL 09',
      status: 'ACTIVE',
      caseFileNumber: generateCaseFileNumber(),
      knownAssociates: '',
      primaryVehicle: '',
      specialTrait: '',
    }),
    []
  )

  const [values, setValues] = useState(initial)
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const errors = useMemo(() => validateIdentity(values), [values])

  const setValue = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const onBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const regenerateCaseFile = () => {
    setValue(CASE_FILE_INDEX, generateCaseFileNumber())
    play('click')
  }

  const classify = () => {
    const validation = validateIdentity(values)
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])))
    if (hasIdentityErrors(validation)) {
      play('error')
      actions.notify('Complete the required fields to classify your cover.', 'error')
      return
    }
    setSubmitting(true)
    const identity = buildIdentityFromForm(values)
    const dossier = generateDossier(identity)
    actions.setIdentity(identity)
    actions.setDossier(dossier)
    play('classify')
    window.setTimeout(() => {
      setSubmitting(false)
      actions.go('decrypt')
    }, 420)
  }

  return (
    <Scene className="identity-form-scene" label="Step three of three — create your cover identity">
      <div className="scene-tools">
        <button type="button" className="back-link" data-cursor="hover" onClick={() => actions.go('editor')}>
          <Icon name="chevronL" size={14} /> Return
        </button>
      </div>

      <div className="step-container step-container--wide">
        <Reveal>
          <div className="step-stepper">
            <Stepper steps={STEPS} current={2} />
          </div>
        </Reveal>

        <Reveal delay={80}>
          <SectionMeta
            index="STEP 03 / 03"
            title="Create Your Cover"
            sub="Every field seeds your classified profile. Choose a legend that holds up under review."
          />
        </Reveal>

        <Reveal delay={160}>
          <TerminalCard title="Operative Cover · Field Intake" className="identity-card">
            <div className="identity-grid" aria-live="polite">
              <RequiredField
                name="codename"
                label="Codename"
                value={values.codename}
                onChange={(v) => setValue('codename', v)}
                onBlur={() => onBlur('codename')}
                error={touched.codename ? errors.codename : null}
                placeholder="NIGHT FOX"
                maxLength={24}
                hint="2–24 characters"
                icon="user"
                autoFocus
              />
              <RequiredField
                name="operation"
                label="Operation"
                value={values.operation}
                onChange={(v) => setValue('operation', v)}
                onBlur={() => onBlur('operation')}
                error={touched.operation ? errors.operation : null}
                placeholder="VICE SHADOW"
                maxLength={40}
                hint="mission designation"
                icon="crosshair"
              />
              <SuggestField
                name="specialization"
                label="Specialization"
                value={values.specialization}
                onChange={(v) => setValue('specialization', v)}
                onBlur={() => onBlur('specialization')}
                error={touched.specialization ? errors.specialization : null}
                placeholder="CYBER OPERATIONS"
                maxLength={40}
                suggestions={SPECIALIZATIONS}
                icon="shield"
              />
              <SuggestField
                name="location"
                label="Location"
                value={values.location}
                onChange={(v) => setValue('location', v)}
                onBlur={() => onBlur('location')}
                error={touched.location ? errors.location : null}
                suggestions={LOCATIONS}
                maxLength={60}
                icon="map"
              />
              <SelectField
                name="clearanceLevel"
                label="Clearance Level"
                value={values.clearanceLevel}
                onChange={(v) => setValue('clearanceLevel', v)}
                onBlur={() => onBlur('clearanceLevel')}
                error={touched.clearanceLevel ? errors.clearanceLevel : null}
                options={CLEARANCE_LEVELS}
                icon="lock"
              />
              <SelectField
                name="status"
                label="Status"
                value={values.status}
                onChange={(v) => setValue('status', v)}
                onBlur={() => onBlur('status')}
                error={touched.status ? errors.status : null}
                options={OPERATIVE_STATUSES}
                icon="idCard"
              />
              <CaseFileField
                value={values.caseFileNumber}
                error={errors.caseFileNumber}
                touched={touched.caseFileNumber}
                onChange={(v) => setValue('caseFileNumber', v)}
                onBlur={() => onBlur('caseFileNumber')}
                onRegenerate={regenerateCaseFile}
              />
              <OptionalField
                name="knownAssociates"
                label="Known Associates"
                value={values.knownAssociates}
                onChange={(v) => setValue('knownAssociates', v)}
                maxLength={120}
                placeholder="Optional · e.g. EX-CONTACT: MARLOWE"
                icon="user"
              />
              <OptionalField
                name="primaryVehicle"
                label="Primary Vehicle"
                value={values.primaryVehicle}
                onChange={(v) => setValue('primaryVehicle', v)}
                maxLength={60}
                placeholder="Optional · e.g. 1979 SABRE GT"
                icon="car"
              />
              <OptionalField
                name="specialTrait"
                label="Special Trait"
                value={values.specialTrait}
                onChange={(v) => setValue('specialTrait', v)}
                maxLength={80}
                placeholder="Optional · e.g. COLD SURVEILLANCE MEMORY"
                icon="eye"
              />
            </div>

            <div className="identity-classify-row" aria-live="polite">
              <p className="identity-classify-note mono micro muted">
                {hasIdentityErrors(errors) && Object.keys(touched).length
                  ? `${Object.keys(errors).length} FIELD(S) REQUIRE ATTENTION`
                  : 'READY FOR CLASSIFICATION'}
              </p>
              <ActionButton
                variant="primary"
                size="lg"
                icon="shield"
                magnetic
                busy={submitting}
                onClick={classify}
                data-cursor="hover"
              >
                Classify Identity
              </ActionButton>
            </div>
          </TerminalCard>
        </Reveal>
      </div>
    </Scene>
  )
}

function FieldShell({ label, name, children, hint, error, maxLength, count }) {
  return (
    <div className={`identity-field ${error ? 'has-error' : ''}`}>
      <div className="field-label-row">
        <label className="field-label mono" htmlFor={`idf-${name}`}>
          {label}
        </label>
        {hint ? <span className="field-hint mono">{error ? '' : hint}</span> : null}
        {count !== undefined ? (
          <span className={`field-hint mono ${count > maxLength ? 'is-over' : ''}`}>{count}/{maxLength}</span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p className="field-error mono" role="alert" id={`idf-${name}-err`}>
          <Icon name="alert" size={12} /> {error}
        </p>
      ) : null}
    </div>
  )
}

function RequiredField({ name, label, value, onChange, onBlur, error, placeholder, maxLength, hint, icon, autoFocus }) {
  return (
    <FieldShell
      label={label}
      name={name}
      icon={icon}
      hint={hint}
      error={error}
      maxLength={maxLength}
      count={value.length}
    >
      <div className="field input-with-icon">
        <Icon name={icon} size={14} className="field-input-icon" />
        <input
          id={`idf-${name}`}
          name={name}
          type="text"
          className={`field-input ${error ? 'has-error' : ''}`}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete="off"
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onBlur={onBlur}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `idf-${name}-err` : undefined}
          data-cursor="text"
        />
      </div>
    </FieldShell>
  )
}

function SuggestField({ name, label, value, onChange, onBlur, error, placeholder, maxLength, suggestions, icon }) {
  const listId = `idf-${name}-list`
  return (
    <FieldShell label={label} name={name} icon={icon} error={error} maxLength={maxLength} count={value.length}>
      <div className="field input-with-icon">
        <Icon name={icon} size={14} className="field-input-icon" />
        <input
          id={`idf-${name}`}
          name={name}
          type="text"
          className={`field-input ${error ? 'has-error' : ''}`}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onBlur={onBlur}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `idf-${name}-err` : undefined}
          list={listId}
        />
        <datalist id={listId}>
          {suggestions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>
    </FieldShell>
  )
}

function SelectField({ name, label, value, onChange, onBlur, error, options, icon }) {
  return (
    <FieldShell label={label} name={name} icon={icon} error={error}>
      <div className="field input-with-icon">
        <Icon name={icon} size={14} className="field-input-icon" />
        <select
          id={`idf-${name}`}
          name={name}
          className={`field-select ${error ? 'has-error' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={error ? 'true' : undefined}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </FieldShell>
  )
}

function CaseFileField({ value, error, touched, onChange, onBlur, onRegenerate }) {
  return (
    <FieldShell label="Case File Number" name="caseFileNumber" icon="file" error={error} hint="auto-issued">
      <div className="field input-with-icon">
        <Icon name="file" size={14} className="field-input-icon" />
        <input
          id="idf-caseFileNumber"
          name="caseFileNumber"
          type="text"
          className={`field-input mono has-inline-action ${error && touched ? 'has-error' : ''}`}
          value={value}
          maxLength={16}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onBlur={onBlur}
          aria-invalid={error && touched ? 'true' : undefined}
        />
        <button
          type="button"
          className="field-inline-action"
          data-cursor="hover"
          title="Regenerate case file number"
          aria-label="Regenerate case file number"
          onClick={onRegenerate}
        >
          <Icon name="refresh" size={14} />
          RNG
        </button>
      </div>
    </FieldShell>
  )
}

function OptionalField({ name, label, value, onChange, maxLength, placeholder, icon }) {
  return (
    <FieldShell label={label} name={name} icon={icon} maxLength={maxLength} count={value.length}>
      <div className="field input-with-icon">
        <Icon name={icon} size={14} className="field-input-icon" />
        <input
          id={`idf-${name}`}
          name={name}
          type="text"
          className="field-input"
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </FieldShell>
  )
}