"use-client";

import { useState } from "react";
import { UseFormRegisterReturn, useWatch } from "react-hook-form";
import { Cron } from "react-js-cron";
import { useTimezoneSelect } from "react-timezone-select";

import { Button } from "@ssb/ui/button";
import { Edit3Icon } from "@ssb/ui/icons";
import { Input } from "@ssb/ui/input";
import { parseCustomCronString } from "@ssb/utils/src/parseCustomCronString";

type Props = {
  registered: UseFormRegisterReturn<string>;
  onChange: (val: string) => void;
};

export const CronPicker = ({ registered, onChange }: Props) => {
  const { options, parseTimezone } = useTimezoneSelect({
    labelStyle: "abbrev",
  });
  const [showRaw, setShowRaw] = useState(false);

  const value = useWatch({ name: registered.name });
  const { cron, timeZone = "Etc/GMT" } = parseCustomCronString(value);
  const onChangeExpression = (val: string) =>
    val !== cron ? onChange(`${val} {${timeZone}}`) : null;
  const onChangeTimeZone = (val: string) =>
    val !== timeZone ? onChange(`${cron} {${val}}`) : null;

  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplate: `
          'input button'
          'select select' / 1fr auto
        `,
      }}
    >
      <div style={{ gridArea: "input" }}>
        <Cron
          clockFormat={"24-hour-clock"}
          defaultPeriod="week"
          leadingZero={true}
          className={`${showRaw ? "hidden" : ""} cron-picker`}
          clearButton={false}
          value={cron}
          setValue={onChangeExpression}
        />
        <Input
          {...registered}
          value={cron}
          onChange={(e) => onChangeExpression(e.target.value)}
          onBlur={(e) => onChangeExpression(e.target.value)}
          className={showRaw ? "" : "hidden"}
        />
      </div>
      <Button
        style={{ gridArea: "button " }}
        type="button"
        variant="ghost"
        onClick={() => {
          setShowRaw(!showRaw);
        }}
      >
        <Edit3Icon>Edit Raw Cron</Edit3Icon>
      </Button>
      <div
        style={{
          gridArea: "select",
        }}
      >
        <select
          value={parseTimezone(timeZone).value}
          className="bg-default block w-full rounded-md p-3 text-sm"
          style={{
            borderBottom: "1px dotted rgba(100,100,100,1)",
          }}
          onChange={(e) =>
            onChangeTimeZone(parseTimezone(e.currentTarget.value).value)
          }
        >
          {options.map((option) => (
            <option value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
