import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

// Encode returnPathname in the same format as authkit-nextjs uses internally
function encodeReturnPathname(returnPathname: string): string {
  return btoa(JSON.stringify({ returnPathname }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export const GET = async (request: NextRequest) => {
  // Get focus areas from query params if present
  const focusAreas = request.nextUrl.searchParams.get("focusAreas");

  // Build return pathname with focus areas if present
  let returnPathname = "/";
  if (focusAreas) {
    returnPathname = `/?focusAreas=${focusAreas}&autoGenerate=true`;
  }

  // Encode the returnPathname in the state parameter
  // This matches how authkit-nextjs internally handles returnPathname
  const state = encodeReturnPathname(returnPathname);

  const signInUrl = await getSignInUrl({ state });

  return redirect(signInUrl);
};
