export const getScheduleTime = (targetDate) => {
  const now = new Date();
  return targetDate.getTime() - now.getTime();
};
