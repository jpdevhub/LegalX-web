import { ImageResponse } from 'next/og'

/**
 * 192px, not 32.
 *
 * Google wants a favicon that is a multiple of 48px and downscales it itself;
 * a 32px source is below that floor and gets passed over. The .ico beside this
 * file still carries 16/32/48 for browser tabs and legacy clients — this is the
 * large raster that search results and Android home screens pick up.
 */
const SIZE = 192

export const size      = { width: SIZE, height: SIZE }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE * 0.22,
          background: '#C9A227',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width={SIZE * 0.69}
          height={SIZE * 0.56}
          viewBox="0 0 160 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="14" y1="8"   x2="14"  y2="114" stroke="#0A0D14" strokeWidth="18" strokeLinecap="round" />
          <line x1="14" y1="114" x2="60"  y2="114" stroke="#0A0D14" strokeWidth="18" strokeLinecap="round" />
          <line x1="66" y1="114" x2="78"  y2="114" stroke="#0A0D14" strokeWidth="18" strokeLinecap="round" />
          <line x1="86" y1="8"   x2="150" y2="114" stroke="#0A0D14" strokeWidth="18" strokeLinecap="round" />
          <line x1="150" y1="8"  x2="86"  y2="114" stroke="#0A0D14" strokeWidth="18" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
