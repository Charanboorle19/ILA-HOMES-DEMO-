import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve(process.cwd(), 'dist')
const indexHtml = resolve(dist, 'index.html')
const fallbackHtml = resolve(dist, '404.html')

if (!existsSync(indexHtml)) {
  console.error('spa-fallback: dist/index.html not found. Run vite build first.')
  process.exit(1)
}

copyFileSync(indexHtml, fallbackHtml)
console.log('spa-fallback: wrote dist/404.html for deep-link refreshes')
