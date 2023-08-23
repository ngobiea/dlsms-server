import { v4 as uuidv4 } from 'uuid';

export const generateClassroomCode = () => {
  const num = 8;
  return uuidv4().replace(/-/g, '').substring(0, num);
};
