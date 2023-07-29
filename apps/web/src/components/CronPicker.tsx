"use-client";

import { useState } from "react";
import { UseFormRegisterReturn, useWatch } from "react-hook-form";
import { Cron } from "react-js-cron";

import { Button } from "@ssb/ui/button";
import { Edit3Icon } from "@ssb/ui/icons";
import { Input } from "@ssb/ui/input";

type Props = {
  registered: UseFormRegisterReturn<string>;
  onChange: (val: string) => void;
};

export const CronPicker = ({ registered, onChange }: Props) => {
  const [showRaw, setShowRaw] = useState(false);
  const value = useWatch({ name: registered.name });
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2">
      <Cron
        clockFormat={"24-hour-clock"}
        defaultPeriod="week"
        leadingZero={true}
        className={`${showRaw ? "hidden" : ""} cron-picker`}
        clearButton={false}
        value={value}
        setValue={onChange}
      />
      <Input {...registered} className={showRaw ? "" : "hidden"} />
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setShowRaw(!showRaw);
        }}
      >
        <Edit3Icon>Edit Raw Cron</Edit3Icon>
      </Button>
    </div>
  );
};
