import { db, Standups, Standup } from "@/lib/orm";

const fetchStandups = async (): Promise<Standup[]> => {
  try {
    return await db.select().from(Standups);
  } catch (e) {
    console.error(e);
    return [];
  }
};

export default async function Users() {
  const users = await fetchStandups();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      Dashboard
    </main>
  );
}
