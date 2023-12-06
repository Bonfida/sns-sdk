const uniq = <T>(array: T[]) => [...new Set(array)];

const chars = ["-", "_"];

const getRandomChar = () => {
  const i = Math.floor(2 * Math.random());
  return chars[i];
};

export const generateRandomDomain = (domain: string, min = 4) => {
  const results: string[] = [];
  for (let i = 0; i < min; i++) {
    results.push(domain + getRandomChar() + Math.floor(100 * Math.random()));
  }
  return uniq(results);
};
