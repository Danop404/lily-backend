import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { env } from "./env";

// 源码和编译产物的配置目录均位于项目根目录下两层，避免依赖启动目录。
const { version } = JSON.parse(
  readFileSync(resolve(__dirname, "../../package.json"), "utf8"),
) as { version: string };

export const buildInfo = {
  version,
  ...(env.BUILD_COMMIT ? { commit: env.BUILD_COMMIT } : {}),
};
