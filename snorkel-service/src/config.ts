import { IPlatfroms } from "./InterfaceController";

const config = {
  port: 5000,
  platforms: [
    'instagram',
    'facebook',
    'twitter'
  ] satisfies Array<IPlatfroms>
};

export default config
