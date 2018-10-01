import { Reporter } from ".";
import {
  pathExistsSync,
  ensureDirSync,
  writeFileSync,
  writeJsonSync,
  createWriteStream,
  ensureDir
} from "fs-extra";
import _ from "lodash";
import { exec } from "child_process";
import gunzip from "gunzip-maybe";
import { extract } from "tar-stream";

import { join, resolve as resolvePath, basename, dirname } from "path";
import { Model, ElementMap } from "./types";
import debug from "debug";
import Registry, { getNameVersion } from "./registry";
import findUp = require("find-up");

const log = debug("pie-cli-libs:new-installer");

export default class NewInstaller {
  private installationDir: string;
  private registry: Registry;

  constructor(
    readonly cwd: string,
    private reporter: Reporter,
    readonly uri?: string
  ) {
    if (!pathExistsSync(cwd)) {
      throw new Error(`cwd does not exist: ${cwd}`);
    }

    this.installationDir = join(cwd, ".pie");
    this.registry = new Registry(uri);
  }

  public async install(elements: ElementMap, models: Model[]) {
    ensureDirSync(this.installationDir);
    ensureDirSync(join(this.installationDir, "packages"));

    const workspaceJson = {
      private: true,
      workspaces: [
        "packages/*",
        "packages/*/controller",
        "packages/*/configure"
      ]
    };

    writeJsonSync(join(this.installationDir, "package.json"), workspaceJson);

    await this.downloadPackages(elements);
    await this.yarnInstall();

    log("yarn install complete");
  }

  private async yarnInstall() {
    const yarnFile = await findYarn(__dirname);
    return new Promise((resolve, reject) => {
      exec(
        `node ${yarnFile} install --non-interactive --no-bin-links --ignore-engines --skip-integrity-check`,
        { cwd: this.installationDir },
        (err, stdout, stderr) => {
          log(stdout);

          if (err) {
            reject(
              err.message.indexOf("versions") >= 0
                ? new Error("INVALID_VERSION")
                : err
            );
          } else {
            resolve();
          }
        }
      );
    });
  }

  private async downloadPackages(elements: ElementMap) {
    const info = await Promise.all(
      Object.keys(elements).map(async k => {
        const raw = elements[k];
        const nv = getNameVersion(raw);
        const name = basename(nv.name);

        return {
          element: k,
          name,
          tarball: await this.registry.tarball(elements[k]),
          target: elements[k]
        };
      })
    );

    log("tarballs:", info);

    return Promise.all(
      info.map(async tb => {
        const dir = await streamTarball(
          tb.tarball,
          tb.name,
          resolvePath(this.installationDir, "packages")
        );

        return {
          dir,
          ...tb
        };
      })
    );
  }
}

const findYarn = (startDir: string) => {
  return findUp(join("node_modules", "yarn", "lib", "cli.js"), {
    cwd: startDir
  }).then(p => {
    log("[findYarnCmd] p: ", p);
    if (!p) {
      throw new Error(`path is undefined`);
    }
    return p;
  });
};

const streamTarball = (
  url: string,
  name: string,
  dir: string
): Promise<string> =>
  new Promise((resolve, reject) => {
    ensureDirSync(join(dir, name));
    const agent = url.startsWith("https") ? require("https") : require("http");
    agent.get(url, res => {
      const e = extract();
      e.on("entry", async (header, stream, done) => {
        const outPath = join(dir, name, header.name.replace("package/", ""));
        log(`stream to: ${outPath}`);

        await ensureDir(dirname(outPath));
        const ws = createWriteStream(outPath);

        ws.on("finish", i => {
          ws.close();
          done();
        });

        ws.on("error", err => done(err));
        stream.pipe(ws);
      });

      e.on("finish", () => {
        resolve(join(dir, name));
      });

      e.on("error", err => reject(err));

      res.pipe(gunzip()).pipe(e);
    });
  });
