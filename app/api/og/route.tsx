import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Dynamic params
    const title = searchParams.get('title') || 'Course Details';
    const category = searchParams.get('category') || 'Technology';
    const instructor = searchParams.get('instructor') || 'HivePod Faculty';
    const difficulty = searchParams.get('difficulty') || 'Beginner';

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
            backgroundColor: '#000',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #333 2%, transparent 0%), radial-gradient(circle at 75px 75px, #333 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            color: 'white',
            fontFamily: 'sans-serif',
            padding: '40px 80px',
          }}
        >
          {/* Background Glows */}
          <div style={{ position: 'absolute', top: -100, left: -100, width: 600, height: 600, background: '#ff453a', filter: 'blur(150px)', opacity: 0.3, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -100, right: -100, width: 600, height: 600, background: '#5e5ce6', filter: 'blur(150px)', opacity: 0.3, borderRadius: '50%' }} />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '100%',
              height: '100%',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '60px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header: Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(255, 69, 58, 0.2)', color: '#ff453a', padding: '8px 24px', borderRadius: '100px', fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Course
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.8)', padding: '8px 24px', borderRadius: '100px', fontSize: 24, fontWeight: 'bold' }}>
                {category}
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.8)', padding: '8px 24px', borderRadius: '100px', fontSize: 24, fontWeight: 'bold' }}>
                {difficulty}
              </div>
            </div>

            {/* Main Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: 'auto', marginBottom: 'auto' }}>
              <h1
                style={{
                  fontSize: 72,
                  fontWeight: 900,
                  color: 'white',
                  margin: 0,
                  lineHeight: 1.1,
                  letterSpacing: '-2px',
                }}
              >
                {title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 32, color: 'rgba(255, 255, 255, 0.6)' }}>
                <span>by <strong style={{ color: 'white', fontWeight: 700 }}>{instructor}</strong></span>
              </div>
            </div>

            {/* Footer / Branding */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: 'auto' }}>
              <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', color: 'white' }}>
                HivePod
              </div>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.3)' }} />
              <div style={{ fontSize: 24, color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>
                Learning & Podcasting Platform
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
