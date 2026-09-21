import { forwardRef } from 'react'
import Icon from '../common/Icon'

function Barcode({ seed, width = 148, height = 26 }) {
  const bars = []
  let acc = 7
  for (let i = 0; i < seed.length; i += 1) acc = (acc * 31 + seed.charCodeAt(i)) % 997
  for (let i = 0; i < 36; i += 1) {
    acc = (acc * 1103515245 + 12345) % 2147483648
    const b = (acc % 3) + 1
    bars.push(b)
  }
  const step = width / bars.reduce((s, b) => s + b, 0)
  const row = bars.map((b, i) => (
    <span key={i} style={{ width: b * step, background: i % 2 === 0 ? '#16181c' : 'transparent' }} />
  ))
  return (
    <div className="dossier-barcode mono" aria-hidden="true">
      <div className="dossier-barcode-bars" style={{ width, height }}>
        {row}
      </div>
      <span>{seed.slice(0, 12)}</span>
    </div>
  )
}

function MicroText({ children }) {
  return <span className="dossier-micro mono">{children}</span>
}

const DossierDocument = forwardRef(function DossierDocument({ identity, dossier, photo }, ref) {
  const redactionBar = (w) => (
    <span className="dossier-redact" style={{ width: w }} aria-hidden="true">
      <span />
      <span />
    </span>
  )

  return (
    <div ref={ref} className="dossier-paper" data-export-surface>
      <div className="dossier-perf" aria-hidden="true" />

      <header className="dossier-top">
        <div className="dossier-classified-tape">
          <span>CLASSIFIED</span>
          <span className="dossier-tape-dots" aria-hidden="true" />
          <span>CLASSIFIED</span>
          <span className="dossier-tape-dots" aria-hidden="true" />
          <span>CLASSIFIED</span>
        </div>

        <div className="dossier-office">
          <div className="dossier-emblem" aria-hidden="true">
            <Icon name="logo" size={40} strokeWidth={1.4} />
          </div>
          <div className="dossier-office-text">
            <p className="dossier-division">{dossier.division}</p>
            <h2 className="dossier-branch">{dossier.branch}</h2>
            <p className="dossier-office-sub mono">
              OFFICIAL RECORD · {dossier.documentId}
            </p>
          </div>
          <div className="dossier-level-tag">
            <p className="dossier-level-tag-k mono">ACCESS</p>
            <p className="dossier-level-tag-v">{dossier.clearanceLevel}</p>
            <p className="dossier-level-tag-k mono">{dossier.securityLevel}</p>
          </div>
        </div>
      </header>

      <div className="dossier-watermark" aria-hidden="true">
        VICE CITY
      </div>

      <main className="dossier-body">
        <aside className="dossier-photo-col">
          <div className="dossier-photo-frame">
            {photo ? (
              <img className="dossier-photo" src={photo} alt={`Official subject photograph for operative ${identity.codename}`} />
            ) : (
              <div className="dossier-photo-empty">
                <Icon name="user" size={44} />
              </div>
            )}
            <div className="dossier-photo-id mono">SUBJECT NO. {dossier.fingerprintHash}</div>
          </div>

          <div className="dossier-photo-caption">
            <p className="dossier-photo-label">SUBJECT PHOTOGRAPH</p>
            <p className="dossier-photo-note mono micro">
              OFFICIAL USE AUTHORIZED · {dossier.issuedLabel}
            </p>
          </div>

          <Barcode seed={dossier.documentId} />

          <div className="dossier-associates">
            <p className="dossier-block-label">FIELD NOTES</p>
            <p className="dossier-associates-line mono">
              TRAIT: {identity.specialTrait ? identity.specialTrait.toUpperCase() : 'NOT RECORDED'}
              <span className="dossier-micro"> · REDACTED</span>
            </p>
            {identity.knownAssociates ? (
              <p className="dossier-associates-line mono micro">
                KNOWN ASSOCIATES: {identity.knownAssociates.toUpperCase()}
              </p>
            ) : null}
            {identity.primaryVehicle ? (
              <p className="dossier-associates-line mono micro">
                VEHICLE: {identity.primaryVehicle.toUpperCase()}
              </p>
            ) : null}
            <div className="dossier-associates-more mono micro">
              PROCESSING NOTES {redactionBar(92)}
              <span style={{ display: 'block', marginTop: 3 }}>
                HANDLER LOG {redactionBar(78)}
              </span>
            </div>
          </div>
        </aside>

        <section className="dossier-details">
          <p className="dossier-codename-meta mono micro gold">OPERATIVE DESIGNATION</p>
          <h1 className="dossier-codename">{identity.codename}</h1>

          <div className="dossier-detail-grid">
            <div className="dossier-detail">
              <p className="dossier-detail-k">OPERATION</p>
              <p className="dossier-detail-v">{identity.operation}</p>
            </div>
            <div className="dossier-detail">
              <p className="dossier-detail-k">SPECIALIZATION</p>
              <p className="dossier-detail-v">{identity.specialization}</p>
            </div>
            <div className="dossier-detail">
              <p className="dossier-detail-k">LOCATION</p>
              <p className="dossier-detail-v">{identity.location}</p>
            </div>
            <div className="dossier-detail">
              <p className="dossier-detail-k">CLEARANCE LEVEL</p>
              <p className="dossier-detail-v">{identity.clearanceLevel}</p>
            </div>
            <div className="dossier-detail">
              <p className="dossier-detail-k">STATUS</p>
              <p className="dossier-detail-v">{identity.status}</p>
            </div>
            <div className="dossier-detail">
              <p className="dossier-detail-k">CASE FILE NUMBER</p>
              <p className="dossier-detail-v mono">{identity.caseFileNumber}</p>
            </div>
          </div>

          <div className="dossier-classification-band">
            <span className="dossier-starburst" aria-hidden="true" />
            <span className="dossier-classification-text">CLASSIFICATION: {dossier.classification}</span>
            <span className="dossier-starburst" aria-hidden="true" />
          </div>

          <div className="dossier-metadata">
            <div className="dossier-meta-cell">
              <MicroText>ISSUED</MicroText>
              <p className="dossier-meta-v mono">{dossier.issuedLabel}</p>
            </div>
            <div className="dossier-meta-cell">
              <MicroText>CASE STATUS</MicroText>
              <p className="dossier-meta-v mono">{dossier.caseStatus}</p>
            </div>
            <div className="dossier-meta-cell">
              <MicroText>SECURITY LEVEL</MicroText>
              <p className="dossier-meta-v mono">{dossier.securityLevel}</p>
            </div>
            <div className="dossier-meta-cell">
              <MicroText>DOCUMENT ID</MicroText>
              <p className="dossier-meta-v mono">{dossier.documentId}</p>
            </div>
          </div>

          <div className="dossier-stamp-row">
            <div className="dossier-signatures">
              <div className="dossier-signature">
                <span className="dossier-sign-line" />
                <p className="dossier-sign-name mono micro">SPONSORING OFFICER</p>
                <p className="dossier-sign-hand mono">{dossier.clearedBy}</p>
              </div>
              <div className="dossier-signature">
                <span className="dossier-sign-line" />
                <p className="dossier-sign-name mono micro">DIVISION SEAL</p>
                <p className="dossier-sign-hand mono">VERIFIED · {dossier.issuedTime} UTC</p>
              </div>
            </div>
            <div className="dossier-approved-stamp" aria-hidden="true">
              APPROVED FOR
              <br />
              OPERATION
            </div>
          </div>
        </section>
      </main>

      <footer className="dossier-foot">
        <p className="dossier-foot-left mono micro">
          THIS DOCUMENT IS A FICTIONAL CREATIVE ASSET. ANY RESEMBLANCE TO ACTUAL PERSONS OR AGENCIES IS COINCIDENTAL.
        </p>
        <p className="dossier-foot-right mono micro">
          UNDERCOVER IDENTITY · SESSION-GENERATED IN-BROWSER · {dossier.documentId}
        </p>
      </footer>
    </div>
  )
})

export default DossierDocument