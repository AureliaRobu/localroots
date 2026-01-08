import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0fdf4',
          backgroundImage: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#16a34a',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 36,
              fontWeight: 700,
              marginRight: 20,
            }}
          >
            LR
          </div>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#166534',
            }}
          >
            LocalRoots
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: '#15803d',
            marginBottom: 20,
            fontWeight: 600,
          }}
        >
          Real farmers. Real food. Real connections.
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 24,
            color: '#4b5563',
            maxWidth: 800,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          Connect with local organic farmers and discover fresh, sustainable produce in your community
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: '#16a34a',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
