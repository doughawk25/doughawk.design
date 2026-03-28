import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(to bottom, #cce8f4, #8eedc7, #c8f542)',
          borderRadius: 6,
        }}
      />
    ),
    { ...size }
  )
}
