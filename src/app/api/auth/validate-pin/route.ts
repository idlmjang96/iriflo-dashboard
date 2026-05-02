import { NextRequest, NextResponse } from 'next/server';
import { validatePIN } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();
    
    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ success: false, error: 'PIN tidak valid' }, { status: 400 });
    }
    
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    if (!validatePIN(pin, ipAddress)) {
      return NextResponse.json({ success: false, error: 'PIN salah' }, { status: 401 });
    }
    
    // Set secure HTTP-only cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'auth_token',
      value: 'authenticated',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 28800, // 8 hours
      path: '/',
    });
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
