import Long from "long";

const timestampFromDatetimeLocal = (datetimeLocal: string): Long => {
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
  return Long.fromNumber(dateObj.getTime(), true).divide(1000);
};

export { timestampFromDatetimeLocal };
