import Link from "next/link";
import { listProblems } from "@repo/db";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const problems = await listProblems();
  return (
    <div>
      <ul>
        {problems.map((problem) => (
          <li key={problem}>
            <Link href={`/problem/${problem}`}>{problem}</Link>
          </li>
        ))}
        <Link href={"/problem/create"}>
          <Button variant={"outline"}>Create Problem</Button>
        </Link>
      </ul>
    </div>
  );
}
