import { AddToSlack } from "@/components/AddToSlack";

export default function SignBot() {
  return (
    <main className="mb-32 max-w-5xl text-center">
      <h1 className="mb-2 text-2xl font-bold">Installation</h1>
      <p className="mb-6">
        Please install the bot on your workspace to continue
      </p>
      <AddToSlack />
    </main>
  );
}
