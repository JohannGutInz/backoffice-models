import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/session";

// Solo protege las rutas del backoffice — la landing pública ((public)) y /login
// quedan fuera vía el matcher de abajo, así que aquí no hace falta distinguirlas.
export async function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  if (sessionToken) {
    const session = await verifySessionToken(sessionToken);
    if (session) return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  matcher: [
    // Excluye además cualquier archivo estático de /public (ej. la imagen del banner)
    // por extensión — si no, el proxy lo intercepta antes de que Next.js pueda servirlo.
    "/((?!login|talentos|portafolio|contacto|registro|retro|api|_next|favicon\\.ico|.*\\.(?:png|jpe?g|webp|avif|gif|svg|ico|css|js|map|txt|xml|json|woff2?|ttf)$|$).*)",
  ],
};
