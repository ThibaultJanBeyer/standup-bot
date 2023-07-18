import { type App } from "@slack/bolt";

type Props = {
  app: App;
  token: string;
  member: string;
};

export const openConversation = async ({ app, member, token }: Props) => {
  try {
    const conversation = await app.client.conversations.open({
      token,
      users: member,
    });
    return conversation?.channel?.id;
  } catch (error) {
    console.error("Error Opening Conversation", error);
  }
};
