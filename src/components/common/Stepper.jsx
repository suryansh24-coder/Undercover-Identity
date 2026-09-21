import { Fragment } from 'react'
import Icon from './Icon'

export function Stepper({ steps = [], current = 0 }) {
  return (
    <div className="stepper" role="list" aria-label="Identity workflow progress">
      {steps.map((step, index) => {
        const done = index < current
        const active = index === current
        return (
          <Fragment key={step.key}>
            {index > 0 ? <span className="stepper-rail" aria-hidden="true" /> : null}
            <div
              className={`stepper-item ${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`}
              role="listitem"
              aria-current={active ? 'step' : undefined}
            >
              <span className="stepper-num mono">
                {done ? <Icon name="check" size={11} /> : step.index}
              </span>
              <span className="stepper-label mono">{step.label}</span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}