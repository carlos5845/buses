// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Crear cliente Supabase (edge runtime)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => req.cookies.get(key)?.value,
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no hay sesión y se intenta acceder a /chofer → redirigir
  if (!user && req.nextUrl.pathname.startsWith("/chofer")) {
    return NextResponse.redirect(new URL("/Auth/login", req.url));
  }

  return res;
}

// Definir rutas que quieres proteger con middleware
export const config = {
  matcher: ["/chofer/:path*"],
};
