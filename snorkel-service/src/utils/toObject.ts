export default function toObject(o: any) {
  const res: any = {};//or Object.create(null)
  for (const key in o) res[key] = o[key];
  return res;
};

