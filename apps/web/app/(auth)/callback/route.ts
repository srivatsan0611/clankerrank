import { handleAuth } from "@workos-inc/authkit-nextjs";

// The returnPathname is extracted from the state parameter set in login/route.ts
// If no returnPathname was set, it defaults to "/"
export const GET = handleAuth();
