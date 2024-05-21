import splitGraphemes from "graphemesplit";

/**
 * This function can be used to retrieve the registration cost in USD of a domain
 * from its name
 * @param name - Domain name
 * @returns price
 */
export const getDomainPriceFromName = (name: string) => {
  const split = splitGraphemes(name);

  switch (split.length) {
    case 1:
      return 750;
    case 2:
      return 700;
    case 3:
      return 640;
    case 4:
      return 160;
    default:
      return 20;
  }
};
