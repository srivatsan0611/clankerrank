export default async function Page({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const { problemId } = await params;
  return <div>Problem: {problemId}</div>;
}
