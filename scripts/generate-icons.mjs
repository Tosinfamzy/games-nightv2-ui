// Generates the app icon set + OG share image from the SVG sources.
//   node scripts/generate-icons.mjs
// Sources: public/favicon.svg (brand mark), scripts/og-source.svg (share card).
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')

const iconSvg = await readFile(join(pub, 'favicon.svg'))
const ogSvg = await readFile(join(root, 'scripts', 'og-source.svg'))

const png = (svg, size) =>
  sharp(svg, { density: 384 }).resize(size, size).png().toBuffer()

// PWA + Apple + raster app icons (all from the one mark)
const targets = [
  ['logo192.png', 192],
  ['logo512.png', 512],
  ['apple-touch-icon.png', 180],
]
for (const [name, size] of targets) {
  await writeFile(join(pub, name), await png(iconSvg, size))
  console.log(`✓ ${name} (${size}x${size})`)
}

// Multi-size .ico for legacy/broad support
const icoSizes = [16, 32, 48, 64]
const icoPngs = await Promise.all(icoSizes.map((s) => png(iconSvg, s)))
await writeFile(join(pub, 'favicon.ico'), await pngToIco(icoPngs))
console.log(`✓ favicon.ico (${icoSizes.join(', ')})`)

// Open Graph / social share image
await writeFile(
  join(pub, 'og-image.png'),
  await sharp(ogSvg, { density: 192 }).resize(1200, 630).png().toBuffer(),
)
console.log('✓ og-image.png (1200x630)')

console.log('done')
