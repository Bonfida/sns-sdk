import { SNSError } from "../error";

export const check = <T extends SNSError>(bool: boolean, error: T) => {
  if (!bool) {
    throw error;
  }
};
