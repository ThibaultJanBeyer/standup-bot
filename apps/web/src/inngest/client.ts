import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ name: "SSB", logger: console });
