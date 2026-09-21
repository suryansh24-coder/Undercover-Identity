const ICONS = {
  lock: 'M5 11V7a7 7 0 0 1 14 0v4M4 11h16v10H4z',
  shield: 'M12 3l8 3v6c0 4.5-3.2 8.2-8 9.5C7.2 20.2 4 16.5 4 12V6zM9 12l2 2 4-4',
  upload: 'M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3',
  download: 'M12 4v12m0 0l-4-4m4 4l4-4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3',
  check: 'M4 12.5l5 5L20 6.5',
  x: 'M6 6l12 12M18 6L6 18',
  copy: 'M8 8h10v12H8zM12 4H4v12',
  share: 'M12 3v11m0 0l-4-4m4 4l4-4M4 12v8h16v-8',
  refresh: 'M4 12a8 8 0 0 1 13.66-5.66L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.66 5.66L4 16m0 4v-4h4',
  crosshair: 'M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2l2.8 2.8m0-12.8l-2.8 2.8M8.4 15.6l-2.8 2.8M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
  scan: 'M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2m8-14h2a2 2 0 0 1 2 2v2m2 8v2a2 2 0 0 1-2 2h-2M7 12h10',
  eye: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
  fingerprint: 'M5.3 7.8A8.5 8.5 0 0 1 12 4m6.7 3.8A8.5 8.5 0 0 0 12 8m-7.5 4a8.5 8.5 0 0 1 1-2M12 12a8.5 8.5 0 0 0-2.4 4.2M12 12a8.5 8.5 0 0 1 2.4 4.2M12 8v0M6.5 15.5A12 12 0 0 0 12 21a9 9 0 0 1 3-1.5',
  file: 'M6 2h8l6 6v14H6zM14 2v6h6M9 13h6m-6 4h4',
  map: 'M8 4L3 6v14l5-2 8 2 5-2V4l-5 2-8-2zm0 0v14m8-12v14',
  car: 'M5 14l1.5-5A2 2 0 0 1 8.4 7.6h7.2A2 2 0 0 1 17.5 9L19 14M4 14h16v5H4zM7 19v2m10-2v2M7.5 17h.01m8.99 0h.01',
  tag: 'M3 12V4h8l10 10-8 8zM7.5 7.5h.01',
  user: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6 8-6s8 2 8 6',
  archive: 'M3 8h18v13H3zM3 8l2-4h14l2 4M9 13h6',
  pen: 'M4 20l1-4L16 5l3 3L8 19zM14 7l3 3',
  type: 'M5 6h14M12 6v14M8 20h8',
  crop: 'M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14',
  sliders: 'M5 21v-7m0-3V3m7 18v-5m0-4V3m7 18v-9m0-4V3M2 11h6m1 5h6m1 4h6',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 17l.9 2.1L22 20l-2.1.9L19 23l-.9-2.1L16 20l2.1-.9z',
  frame: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM9 3v18M15 3v18M3 9h18M3 15h18',
  image: 'M4 5h16v14H4zM5 16l4-4 3 3 4-4v1',
  chevron: 'M9 6l6 6-6 6',
  chevronL: 'M15 6l-6 6 6 6',
  sound: 'M4 9v6h4l5 4V5L8 9H4zm11.5 1.5a3.5 3.5 0 0 1 0 5m2.5-8a6.5 6.5 0 0 1 0 11',
  mute: 'M4 9v6h4l5 4V5L8 9H4zm12 1l6 6m0-6l-6 6',
  info: 'M12 12v5m0-9h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  arrowL: 'M11 5l-7 7 7 7M4 12h16',
  arrowR: 'M13 5l7 7-7 7M20 12H4',
  undo: 'M4 9h10a5 5 0 0 1 0 10H9M4 9l4-4m-4 4l4 4',
  resize: 'M3 21V3h18v18H3zM9 3v4m6-4v4M3 9h4m-4 6h4M15 21v-4m6-2h-4',
  checkCircle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12l3 3 5-6',
  alert: 'M12 4L2 20h20zM12 10v4m0 3h.01',
  lockRotor: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-4h1',
  idCard: 'M4 4h16v16H4zM8 8h8v3H8zM9 15h6M6 15h.01',
}

const SHAPES = {
  logo: (
    <>
      <path d="M12 2l8.66 5v10L12 22l-8.66-5V7z" fill="none" />
      <path d="M12 7l4.33 2.5v5L12 17l-4.33-2.5v-5z" fill="none" />
    </>
  ),
}

const STROKE_ICONS = new Set(Object.keys(ICONS))

export function Icon({ name, size = 18, strokeWidth = 1.6, className = '', ...rest }) {
  if (SHAPES[name]) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={className}
        aria-hidden="true"
        {...rest}
      >
        {SHAPES[name]}
      </svg>
    )
  }
  const path = ICONS[name]
  if (!path) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d={path} />
    </svg>
  )
}

export { STROKE_ICONS }
export default Icon