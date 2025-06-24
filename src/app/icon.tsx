import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7c3aed" // This is the primary color
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a10 10 0 0 0-3.38 19.46" />
          <path d="M12 2a10 10 0 0 1 8.32 4.19" />
          <path d="M12 22a10 10 0 0 1-3.38-19.46" />
          <path d="M12 22a10 10 0 0 0 8.32-4.19" />
          <path d="M12 2v20" />
          <path d="M12 2a5 5 0 0 0-5 5" />
          <path d="M12 2a5 5 0 0 1 5 5" />
          <path d="M12 22a5 5 0 0 1-5-5" />
          <path d="M12 22a5 5 0 0 0 5-5" />
          <path d="M2 12h20" />
          <path d="M2 12a5 5 0 0 0 5 5" />
          <path d="M2 12a5 5 0 0 1 5-5" />
          <path d="M22 12a5 5 0 0 1-5-5" />
          <path d="M22 12a5 5 0 0 0-5 5" />
        </svg>
      </div >
    ),
    {
      ...size,
    }
  )
}
