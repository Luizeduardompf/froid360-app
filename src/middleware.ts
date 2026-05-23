import { type NextRequest, NextResponse } from 'next/server';

// V0 Demo: auth é totalmente mockada, middleware apenas passa adiante.
// Integração real com Supabase Auth será adicionada na Fase de produção.
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
