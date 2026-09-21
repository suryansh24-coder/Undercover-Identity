import { useMagnetic } from '../../hooks/useMagnetic'
import Icon from './Icon'

const VARIANT_CLASS = {
  primary: 'btn btn--primary',
  ghost: 'btn btn--ghost',
  crimson: 'btn btn--crimson',
  silent: 'btn btn--silent',
  goldLine: 'btn btn--goldline',
}

export function ActionButton({
  children,
  variant = 'primary',
  size = 'lg',
  icon = null,
  magnetic = false,
  busy = false,
  disabled = false,
  className = '',
  type = 'button',
  ...rest
}) {
  const magnetRef = useMagnetic({ enabled: magnetic })
  return (
    <button
      ref={magnetRef}
      type={type}
      data-cursor="hover"
      className={`${VARIANT_CLASS[variant] || VARIANT_CLASS.ghost} btn--${size} ${magnetic ? 'btn--magnetic' : ''} ${className}`}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...rest}
    >
      {busy ? (
        <span className="btn-spinner" aria-label="Processing" role="status">
          <i />
          <i />
          <i />
        </span>
      ) : (
        <>
          {icon ? <Icon name={icon} size={16} className="btn-icon" /> : null}
          <span>{children}</span>
        </>
      )}
    </button>
  )
}

export function IconButton({
  children,
  icon = null,
  label,
  className = '',
  size = 20,
  variant = 'silent',
  ...rest
}) {
  return (
    <button
      type="button"
      data-cursor="hover"
      aria-label={label}
      title={label}
      className={`icon-btn icon-btn--${variant} ${className}`}
      {...rest}
    >
      {icon ? <Icon name={icon} size={size} /> : children}
    </button>
  )
}