export const CronPicker = () => {
  return (
    <>
      <Cron
        clockFormat={"24-hour-clock"}
        defaultPeriod="week"
        leadingZero={true}
        className={"cron-picker"}
        value={scheduleCronValue}
        clearButton={false}
        setValue={setScheduleCronValue}
      />
      <Input
        {...form.register("scheduleCron")}
        // value={scheduleCronValue}
        // style={{ visibility: "hidden", height: 0 }}
        // aria-hidden="true"
      />
    </>
  );
};
