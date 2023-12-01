
const fiftySeconds = 50;

export const getDateTimeDifferenceInSeconds = (startDate, endDate) => {
  return Math.abs((endDate - startDate) / 1000);
};

export const calculateAttendance = (startTime, endTime, verify) => {
  const differenceInSeconds = getDateTimeDifferenceInSeconds(
    startTime,
    endTime
  );
  const totalDuration = differenceInSeconds / fiftySeconds;
  let totalVerify = 0;
  verify.forEach((v) => {
    if (v.isVerify) {
      totalVerify++;
    }
  });
  console.log(totalVerify, totalDuration);
  return Math.floor((totalVerify / totalDuration) * 100);
};
