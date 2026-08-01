import { ImageResponse } from 'next/og';

export const alt = 'Gestión doméstica — el refri y las tareas del hogar, organizados';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 96px',
          backgroundColor: '#4A342A',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              width: 72,
              height: 72,
              borderRadius: 18,
              backgroundColor: '#F5F1EA',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 512 512">
              <path d="M256 100 L376 200 L376 400 L136 400 L136 200 Z" fill="#7D5A44" />
            </svg>
          </div>
          <span style={{ fontSize: 34, fontWeight: 700, color: '#F5F1EA' }}>Gestión doméstica</span>
        </div>

        <div style={{ display: 'flex', marginTop: 56, maxWidth: 920 }}>
          <span style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.15, color: '#F5F1EA' }}>
            El refri y las tareas del hogar, organizados en un solo lugar.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 14, marginTop: 48 }}>
          {['Refri', 'Tareas', 'Avisos automáticos'].map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                padding: '10px 22px',
                borderRadius: 999,
                border: '2px solid #B2967D',
                color: '#D7C9B8',
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
