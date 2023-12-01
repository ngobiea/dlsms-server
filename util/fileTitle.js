const three = 3;
const two = 2;
export const extractAfterSecondSlash = (inputString) => {
  const splitString = inputString.split('/');
  if (splitString.length >= three) {
    return splitString.slice(two).join('/');
  } else {
    return '';
  }
};
