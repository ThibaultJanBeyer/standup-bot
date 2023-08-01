import {
  AnyEventObject,
  BaseActionObject,
  createMachine,
  interpret,
  Interpreter,
  ResolveTypegenMeta,
} from "xstate";

import { StandupBot } from "@/StandupBot";

import { Typegen0 } from "./createStateMachines.typegen";
import { logInfo } from "./utils";

export type BotStateMachine = Interpreter<
  {
    submitted: number;
  },
  any,
  AnyEventObject,
  {
    value: any;
    context: {
      submitted: number;
    };
  },
  ResolveTypegenMeta<Typegen0, AnyEventObject, BaseActionObject, any>
>;

export const createBotStateMachine = (BOT: StandupBot) =>
  interpret(
    createMachine({
      /** @xstate-layout N4IgpgJg5mDOIC5QCED2AXAdASQgGzAGJsA5bAFQG0AGAXUVAAdVYBLdV1AOwZAA9EARgDMgzNQBMwgCwBOAOxzqsgGwAOCWoA0IAJ6JZY4QFYJg2bOPGV8+dUESAvo51osuAoQAKAeQDKVHS8zGwc3LwCCAC0YprGshIq0ubG8grKxjr6CBLUapiy0mlqCipSgorOrhg4XOx+6ACGXBAArozEZOQA+gAiPiQAojT0SCAh7Jw8Y5HSuZiJZYpyxoJqwjZZBkamEhJKZuYqslUgbpgA6o2TXFCEAIoAqoMB2AN+3QCCJH4XgwBKg16I2CLEm4RmiGkpkwajSsmEsmo9mkaiKwi2OQRBRkFgk1mE8jU8VO5yuNzuTxe5DePy+Pz+gOBglGTDBYWmoEitnkmGM1HkNnMmnMakEmIkdgKxjR5mEamoKis+1JNXJHFuhBIPh6Fx8-wA0qQAOIgsYTDkRKFwzDyRGiNaCaQqDZozFRXn81ZWMoqP3ExHGVVYdWsTXa3X6o0kU0s0GhKZWhBiiSYDZ2YS5dQ2YzSd3CaiYVEVTQKhR44OYLwsDV3XwBPoDYZBc3sxOQ6KCeyYQRJdT853HF3aPSITSe6i5uS5ezHaTSZwuEBcVAQOC8Nzx8Gc-iIGJyHt94nUQeqeXuwQVApiu2E+epOeVjxgLeWjtRaTCIsmQMJQTxM9MRsWFdhSFRkRMConzqdAGmaNpGFfdsuTHXMezSXN5ElZE8nkIDeWJPYwIg1Z5ErUNbiQiEUIQeJ8gFQwlVlfY0kxQw012fYkUOVQVEratYFrKid0iKJgLSFQHCSeQuz2BRMWdMRkjmNQ1BdY54gXRcgA */
      id: "Bot",
      tsTypes: {} as import("./createStateMachines.typegen").Typegen0,

      initial: "Idle",

      context: {
        submitted: 0,
      },

      states: {
        Idle: {
          entry: [() => logInfo("idle", BOT.slackWorkspaceId)],
          on: {
            INIT: "InitStandup",
            POST: "Posting",
          },
        },

        InitStandup: {
          entry: [
            (context) => {
              context.submitted = 0;
              logInfo("init", BOT.slackWorkspaceId, context.submitted);
            },
          ],
          on: {
            INIT_DONE: "Waiting",
            POST: "Posting",
          },
        },

        Waiting: {
          entry: [() => logInfo("waiting", BOT.slackWorkspaceId)],
          on: {
            QUESTIONS_ANSWERED: [
              {
                target: "Idle",
                // -1 because the person answering the first question is not included
                cond: (context) => context.submitted >= BOT.members.length - 1,
                actions: [
                  (context) =>
                    logInfo(`answered final`, BOT.slackWorkspaceId, {
                      submitted: context?.submitted,
                      members: BOT.members.length,
                    }),
                ],
                internal: false,
              },
              {
                target: "Waiting",
                actions: [
                  (context) => {
                    context.submitted++;
                    logInfo(`answered`, BOT.slackWorkspaceId, {
                      submitted: context?.submitted,
                      members: BOT.members.length,
                    });
                  },
                ],
              },
            ],
            NOT_WORKING: [
              {
                target: "Idle",
                cond: (context) => context.submitted >= BOT.members.length - 1,
                actions: [
                  (context) =>
                    logInfo(`answered final (nw)`, BOT.slackWorkspaceId, {
                      submitted: context?.submitted,
                      members: BOT.members.length,
                    }),
                ],
                internal: false,
              },
              {
                target: "Waiting",
                actions: [
                  (context) => {
                    context.submitted++;
                    logInfo(`answered (nw)`, BOT.slackWorkspaceId, {
                      submitted: context?.submitted,
                      members: BOT.members.length,
                    });
                  },
                ],
              },
            ],
            POST: "Posting",
          },
        },

        Posting: {
          entry: [() => logInfo("posting", BOT.slackWorkspaceId)],
          on: {
            POST_DONE: "Idle",
          },
        },
      },
      predictableActionArguments: true,
      preserveActionOrder: true,
    }),
  );
