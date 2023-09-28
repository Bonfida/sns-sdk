/**
 * Abbreviates a given text by truncating it to a specified length and adding ellipsis
 * in the middle.
 *
 * @param text - The text to be abbreviated.
 * @param len - The maximum length of the abbreviated text (excluding ellipsis).
 * @param charsAtTheEnd - The number of characters to keep at the end of the text
 *                        before adding ellipsis. Default is 5.
 */
export const abbreviate = (
  text: string | undefined,
  len: number,
  charsAtTheEnd: number = 5
) => {
  if (!text) return "";
  if (text.length <= len) return text;

  return (
    text.slice(0, len - charsAtTheEnd) + "..." + text.slice(-charsAtTheEnd)
  );
};
