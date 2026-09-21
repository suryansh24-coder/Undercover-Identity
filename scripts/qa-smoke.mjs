/**
 * QA smoke test — verifies the production build serves correctly.
 *
 * Usage: node scripts/qa-smoke.mjs
 * Prerequisite: npm run build must have produced ./dist.
 *
 * Steps:
 *   1. Statically inspects dist/index.html for the required shell hooks.
 *   2. Boots `vite preview` on a strict, ephemeral port.
 *   3. Requests /, /favicon.svg, /og.png and the built JS bundle;
 *      asserts HTTP 200 and sensible content types.
 *   4. Reports PASS/FAIL per check and exits non-zero on any failure.
 */

import { spawn } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const PORT = 4173
const BASE = `http://127.0.0.1:${PORT}`

const results = []

function check(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? '  PASS' : '  FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

function assertBuildExists() {
  const indexPath = join(DIST, 'index.html')
  if (!existsSync(indexPath)) {
    console.error('dist/index.html is missing. Run `npm run build` first.')
    process.exit(1)
  }
  return indexPath
}

function inspectIndex() {
  const html = readFileSync(join(DIST, 'index.html'), 'utf8')
  check('has #root mount', html.includes('<div id="root"></div>'))
  check('links favicon.svg', html.includes('/favicon.svg'))
  check('bases og.png image', html.includes('/og.png'))
  check('contains root module script', /src="\/assets\//.test(html))
  const jsBundle = (html.match(/src="\/(assets\/[^"]+\.js)"/) || [])[1]
  check('has a JS bundle path', Boolean(jsBundle), jsBundle || '')
  return jsBundle
}

function spawnPreview() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--port', String(PORT), '--strictPort'],
      { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }
    )
    child.stderr.pipe(process.stderr)
    const deadline = Date.now() + 20000
    const poll = async () => {
      if (Date.now() > deadline) {
        child.kill()
        reject(new Error('preview did not start in time'))
        return
      }
      try {
        const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(3000) })
        if (res.status === 200) {
          resolve(child)
          return
        }
      } catch {
        /* not up yet */
      }
      setTimeout(poll, 250)
    }
    child.on('error', reject)
    child.on('exit', (code) => {
      reject(new Error(`preview exited early with code ${code}`))
    })
    poll()
  })
}

async function fetchCheck(path) {
  const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(10000) })
  return res
}

async function fetchBundle(jsBundle) {
  const res = await fetch(`${BASE}/${jsBundle}`, { signal: AbortSignal.timeout(15000) })
  const body = await res.text()
  const main = body
  const hasConsoleLogPattern = /console\.(log|debug)\(/.test(main)
  check('JS bundle returns 200', res.status === 200, `${res.status}`)
  check('JS bundle contains application marker', body.includes('UNDERCOVER') || body.includes('undercover'), '')
  check(
    'no console.log / console.debug in production bundle',
    !hasConsoleLogPattern
  )
}

async function run() {
  const indexPath = assertBuildExists()
  const headSize = statSync(indexPath).size
  check('dist/index.html exists and is non-trivial', headSize > 500, `${headSize} bytes`)
  const jsBundle = inspectIndex()

  let preview
  try {
    preview = await spawnPreview()
  } catch (err) {
    check('vite preview boots', false, err.message)
    finish(1)
    return
  }

  try {
    try {
      const root = await fetchCheck('/')
      check('GET / returns 200', root.status === 200, `content-type: ${root.headers.get('content-type')}`)
      const body = await root.text()
      check('root HTML carries the title', body.includes('Undercover Identity'))
    } catch (err) {
      check('GET / returns 200', false, err.message)
    }

    const favicon = await fetchCheck('/favicon.svg')
    check('GET /favicon.svg returns 200', favicon.status === 200, `content-type: ${favicon.headers.get('content-type')}`)

    const og = await fetchCheck('/og.png')
    check('GET /og.png returns 200', og.status === 200, `content-type: ${og.headers.get('content-type')}`)

    if (jsBundle) await fetchBundle(jsBundle)
  } catch (err) {
    check('HTTP checks completed', false, err.message)
  }

  preview.kill()
  finish()
}

function finish(code = 0) {
  const failed = results.filter((r) => !r.pass).length
  console.log(`\nSmoke results: ${results.length - failed}/${results.length} checks passed.`)
  if (code !== 0) process.exitCode = code
}

run()