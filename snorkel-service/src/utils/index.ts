export const toObject = (o: any) => {
  const res: any = {};//or Object.create(null)
  for (const key in o) res[key] = o[key];
  return res;
};

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
