import type { BetterAuthClientPlugin } from "better-auth/client";
import type { deviceFingerprintingPlugin } from "./device-fingerprinting";

export const deviceFingerprintingClientPlugin = () => {
  return {
    id: "device-fingerprinting",
    $InferServerPlugin: {} as ReturnType<typeof deviceFingerprintingPlugin>,
  } satisfies BetterAuthClientPlugin;
};
