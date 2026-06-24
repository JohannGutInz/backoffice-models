import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "./lib/session";

// Solo protege las rutas del backoffice — la landing pública ((public)) y /login
// quedan fuera vía el matcher de abajo, así que aquí no hace falta distinguirlas.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // Excluye además cualquier archivo estático de /public (ej. la imagen del banner)
    // por extensión — si no, el proxy lo intercepta antes de que Next.js pueda servirlo.
    "/((?!login|talentos|portafolio|contacto|registro|retro|api|_next|favicon\\.ico|.*\\.(?:png|jpe?g|webp|avif|gif|svg|ico|css|js|map|txt|xml|json|woff2?|ttf)$|$).*)",
  ],
};
