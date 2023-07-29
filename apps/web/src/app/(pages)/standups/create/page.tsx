// @TODO: fix issue with bot login

"use client";

import { startTransition } from "react";
import { Submit } from "@radix-ui/react-form";

import { Button } from "@ssb/ui/button";

import StandupsFormFields, { FormData } from "../StandupsFormFields";
import { createAction } from "./createAction";

export default () => {
  const onSubmit = (data: FormData) => {
    startTransition(() => {
      createAction(data)
        .then((ok) => (location.href = "/standups"))
        .catch((error) => {
          console.log("error", error);
        });
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <StandupsFormFields onSubmit={onSubmit}>
        <Submit asChild>
          <Button type="submit" variant="outlinePrimary">
            Create Standup
          </Button>
        </Submit>
      </StandupsFormFields>
    </main>
  );
};
