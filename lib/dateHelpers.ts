const timestampFromDatetimeLocal = (datetimeLocal: string): number => {
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
  return Math.floor(dateObj.getTime() / 1000);
};

export { timestampFromDatetimeLocal };
