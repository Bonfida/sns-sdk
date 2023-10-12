import { splitGraphemes } from "split-graphemes";

export const priceFromLength = (name: string, discountMultiplier = 1) => {
  const split: string[] = splitGraphemes(name);
  const length = split.length;
  switch (length) {
    case 1:
      return 750 * discountMultiplier;
    case 2:
      return 700 * discountMultiplier;
    case 3:
      return 640 * discountMultiplier;
    case 4:
      return 160 * discountMultiplier;
    default:
      return 20 * discountMultiplier;
  }
};

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",

  minimumFractionDigits: 2,
});

export const formatPrice = (x: number, stripDollar?: boolean) => {
  const f = formatter.format(x);
  if (stripDollar) {
    return f.replace("$", "");
  }
  return f;
};
