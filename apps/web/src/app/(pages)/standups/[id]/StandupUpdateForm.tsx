"use client";

import { startTransition } from "react";
import * as Form from "@radix-ui/react-form";

import { Button } from "@ssb/ui/button";

import StandupsFormFields, { FormData } from "../StandupsFormFields";
import { deleteAction } from "./deleteAction";
import { updateAction } from "./updateAction";

export const StandupUpdateForm = ({
  data,
  id,
}: {
  data: FormData;
  id: string;
}) => {
  const onSubmit = (data: FormData) => {
    startTransition(() => {
      updateAction({ id, ...data })
        .then((ok) => (location.href = "/standups"))
        .catch((error) => {
          console.log("error", error);
        });
    });
  };

  const onDelete = () => {
    if (!confirm("Are you sure you want to delete this standup?")) return;
    startTransition(() => {
      deleteAction({ id })
        .then((ok) => (location.href = "/standups"))
        .catch((error) => {
          console.log("error", error);
        });
    });
  };

  return (
    <StandupsFormFields onSubmit={onSubmit} data={data}>
      <div className="mt-10 grid grid-cols-2 gap-10">
        <Form.Submit asChild>
          <Button type="submit" variant="outlinePrimary">
            Update Standup
          </Button>
        </Form.Submit>
        <Button onClick={onDelete} type="button" variant={"destructive"}>
          Delete Standup
        </Button>
      </div>
    </StandupsFormFields>
  );
};
