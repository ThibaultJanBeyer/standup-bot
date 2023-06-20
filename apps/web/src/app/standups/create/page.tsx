"use client";
import { useState } from 'react';
import { useUser } from "@clerk/nextjs";

import { NewStandup } from "@/lib/orm";

export default function CreateStandupPage() {
  const user = useUser();
  const [name, setName] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [channelId, setChannelId] = useState('');
  const [scheduleCron, setScheduleCron] = useState('');
  const [summaryCron, setSummaryCron] = useState('');
  const [members, setMembers] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newStandup: NewStandup = {
      name,
      workspaceId,
      channelId,
      scheduleCron,
      summaryCron,
      authorId: user?.user?.id || '',
      members: members.split(',').map((member) => member.trim())
    };

    fetch('/api/standups/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newStandup),
    })
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Workspace ID:
          <input type="text" value={workspaceId} onChange={(e) => setWorkspaceId(e.target.value)} />
        </label>
        <br />
        <label>
          Channel ID:
          <input type="text" value={channelId} onChange={(e) => setChannelId(e.target.value)} />
        </label>
        <label>
          Members:
          <input type="text" value={members} onChange={(e) => setMembers(e.target.value)} />
        </label>
        <br />
        <label>
          Schedule Cron:
          <input type="text" value={scheduleCron} onChange={(e) => setScheduleCron(e.target.value)} />
        </label>
        <br />
        <label>
          Summary Cron:
          <input type="text" value={summaryCron} onChange={(e) => setSummaryCron(e.target.value)} />
        </label>
        <br />
        <button type="submit">Create Standup</button>
      </form>
    </main>
  );
}