import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 200,
          background: '#16a34a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          borderRadius: 80,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        LR
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  )
}
