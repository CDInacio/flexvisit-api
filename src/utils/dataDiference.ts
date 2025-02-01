const parseDateTime = (dateTime: string) => {
  const [datePart, timePart] = dateTime?.split(" ");
  const [day, month, year] = datePart?.split("/");
  const [hours, minutes] = timePart?.split(":");
  return new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
};

export const calculateDateDifference = (
  scheduleDateTime: string
): { days: number; hours: number; minutes: number } => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); 
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}`;
  
  const date1 = parseDateTime(formattedDateTime);
  const date2 = parseDateTime(scheduleDateTime);

  const differenceInMilliseconds = date2.getTime() - date1.getTime();

  const differenceInMinutes = differenceInMilliseconds / (1000 * 60);
  const differenceInHours = Math.floor(differenceInMinutes / 60);
  const remainingMinutes = Math.floor(differenceInMinutes % 60);
  const differenceInDays = Math.floor(differenceInHours / 24);
  const remainingHours = differenceInHours % 24;

  return {
    days: differenceInDays,
    hours: remainingHours,
    minutes: remainingMinutes,
  };
};
