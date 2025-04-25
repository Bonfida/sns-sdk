import { SNSError } from "../errors";

/**
 * Checks a boolean condition and throws a specified error if the condition is false.
 * This function is intended for internal use only.
 * @template T - The type of error to be thrown, extending SNSError.
 * @param {boolean} bool - The boolean condition to check.
 * @param {T} error - The error to be thrown if the condition is false.
 * @throws {T} Throws the specified error if the condition is false.
 */
export const _check = <T extends SNSError>(bool: boolean, error: T) => {
  if (!bool) {
    throw error;
  }
};
