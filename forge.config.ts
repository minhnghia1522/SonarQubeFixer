import path from "node:path";
import { access, cp, mkdir, rm } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

const projectRoot = path.resolve(__dirname);
const runtimeDeps = ["sonarqube-web-api-client"];

async function pathExists(target: string): Promise<boolean> {
  try {
    await access(target, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function ensureRuntimeDependencies(buildPath: string): Promise<void> {
  const buildNodeModules = path.join(buildPath, "node_modules");
  await mkdir(buildNodeModules, { recursive: true });

  for (const dependency of runtimeDeps) {
    const source = path.join(projectRoot, "node_modules", dependency);

    if (!(await pathExists(source))) {
      console.warn(
        `[forge-hooks] Bỏ qua copy dependency "${dependency}" vì không tìm thấy nguồn tại ${source}.`
      );
      continue;
    }

    const destination = path.join(buildNodeModules, dependency);

    try {
      await rm(destination, { recursive: true, force: true });
      await cp(source, destination, { recursive: true, dereference: true });
      console.info(
        `[forge-hooks] Đã copy dependency "${dependency}" vào ${destination}.`
      );
    } catch (error) {
      console.error(
        `[forge-hooks] Lỗi khi copy dependency "${dependency}" vào bundle.`,
        error
      );
      throw error;
    }
  }
}

const config: ForgeConfig = {
  packagerConfig: {
    asar: {
      unpackDir: "node_modules",
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerZIP({}, ["win32"]),
    new MakerDMG({}),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  hooks: {
    packageAfterPrune: async (_config, buildPath) => {
      await ensureRuntimeDependencies(buildPath);
    },
  },
};

export default config;
