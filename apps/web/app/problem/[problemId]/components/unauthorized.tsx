"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UnauthorizedRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <h2 className="text-2xl font-semibold mb-4 text-center">Unauthorized</h2>
      <p className="mb-2 text-center">
        You do not have permission to access this page.
      </p>
      <p className="text-center text-gray-500">
        Redirecting to the homepage in 5 seconds... (Click{" "}
        <Link href="/">here</Link> to redirect now)
      </p>
    </div>
  );
}
