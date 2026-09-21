import Icon from './Icon'

export function Reveal({ children, delay = 0, className = '', as: Tag = 'div', ...rest }) {
  const style = { '--reveal-delay': `${delay}ms` }
  return (
    <Tag className={`reveal ${className}`} style={style} {...rest}>
      {children}
    </Tag>
  )
}

export function Scene({ children, className = '', label = '', ...rest }) {
  return (
    <section
      className={`scene ${className}`}
      data-scene
      aria-label={label || undefined}
      {...rest}
    >
      {children}
    </section>
  )
}

export function SystemLabel({ children, icon = null, className = '' }) {
  return (
    <p className={`system-label ${className}`}>
      {icon ? <Icon name={icon} size={13} /> : <span className="system-label-dash" aria-hidden="true" />}
      <span>{children}</span>
    </p>
  )
}

export function SectionMeta({ index, title, sub, right }) {
  return (
    <header className="section-meta">
      <div>
        <p className="section-meta-index mono micro gold">{index}</p>
        <h2 className="section-meta-title">{title}</h2>
      </div>
      {sub ? <p className="section-meta-sub muted">{sub}</p> : null}
      {right}
    </header>
  )
}

export function TerminalCard({ children, className = '', title = '', onIcon = null, corners = true }) {
  return (
    <div className={`terminal-card ${corners ? 'terminal-card--corners' : ''} ${className}`}>
      <div className="terminal-card-head">
        <span className="terminal-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="terminal-card-title mono">{title}</span>
        {onIcon ? <span className="terminal-card-icon">{onIcon}</span> : <span />}
      </div>
      <div className="terminal-card-body">{children}</div>
    </div>
  )
}