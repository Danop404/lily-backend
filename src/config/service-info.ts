import packageJson from "../../package.json";

import { env } from "./env";

export const getServiceInfo = () => ({
  version: packageJson.version,
  ...(env.BUILD_COMMIT ? { commit: env.BUILD_COMMIT } : {}),
});
