export const getSiteKey = (sitefile: string) => {
  return String(sitefile)
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
};
export default getSiteKey;
