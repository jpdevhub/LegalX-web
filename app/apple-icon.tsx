import { ImageResponse } from 'next/og'

export const size        = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: '#C9A227',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width={130}
          height={105}
          viewBox="0 0 160 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="14" y1="8"   x2="14"  y2="114" stroke="#0A0D14" strokeWidth="16" strokeLinecap="round" />
          <line x1="14" y1="114" x2="60"  y2="114" stroke="#0A0D14" strokeWidth="16" strokeLinecap="round" />
          <line x1="66" y1="114" x2="78"  y2="114" stroke="#0A0D14" strokeWidth="16" strokeLinecap="round" />
          <line x1="86" y1="8"   x2="150" y2="114" stroke="#0A0D14" strokeWidth="16" strokeLinecap="round" />
          <line x1="150" y1="8"  x2="86"  y2="114" stroke="#0A0D14" strokeWidth="16" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
