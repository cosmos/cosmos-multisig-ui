import Long from "long";

export const timestampFromDatetimeLocal = (
  datetimeLocal: string,
  units?: "s" | "ms" | "ns",
): Long => {
  const [date, time] = datetimeLocal.split("T");
  const [year, month, day] = date.split("-");
  const [hours, minutes] = time.split(":");

  const dateObj = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
  );

  const timestampMillis = Long.fromNumber(dateObj.getTime());

  switch (units) {
    case "s":
      return timestampMillis.divide(1000); // seconds
    case "ns":
      return timestampMillis.divide(1000_000); // nanoseconds
    default:
      return timestampMillis; // milliseconds
  }
};

// With stripped seconds and milliseconds
export const datetimeLocalFromTimestamp = (timestamp: number): string => {
  const minDate = new Date(timestamp);

  const minMonth = minDate.getMonth() + 1; // It's 0-indexed
  const minMonthStr = minMonth < 10 ? `0${minMonth}` : String(minMonth);

  const minDay = minDate.getDate();
  const minDayStr = minDay < 10 ? `0${minDay}` : String(minDay);

  const minHours = minDate.getHours();
  const minHoursStr = minHours < 10 ? `0${minHours}` : String(minHours);

  const minMinutes = minDate.getMinutes();
  const minMinutesStr = minMinutes < 10 ? `0${minMinutes}` : String(minMinutes);

  return `${minDate.getFullYear()}-${minMonthStr}-${minDayStr}T${minHoursStr}:${minMinutesStr}`;
};
