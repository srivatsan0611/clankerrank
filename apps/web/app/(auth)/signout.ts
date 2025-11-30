"use server";

import { signOut } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export const signOutAction = async () => {
  await signOut();
  redirect("http://localhost:3000");
};
