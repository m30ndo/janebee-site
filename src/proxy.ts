import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Private preview gate.
 * While SITE_PASSWORD is set, every page asks for a password (HTTP Basic Auth,
 * any username). Remove the env var on launch day to open the site.
 */
export function proxy(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next();

  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const supplied = decoded.slice(decoded.indexOf(":") + 1);
      if (supplied === password) return NextResponse.next();
    } catch {
      // fall through to the challenge
    }
  }

  return new NextResponse("Jane Bee — private preview", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Jane Bee preview", charset="UTF-8"',
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
