import { install, InstallResult } from "..";
import { setDefaultLevel, buildLogger } from "log-factory";
// tslint:disable-next-line:no-implicit-dependencies
import * as temp from "temp";
import { ensureDir, pathExists } from "fs-extra";
import { join, resolve } from "path";
import { mkLocalPackage, mkReporter } from "./utils";

setDefaultLevel("info");

const logger = buildLogger();

const reporter = mkReporter(logger);

describe("installer", () => {
  let tmpPath = null;

  beforeAll(done => {
    jest.setTimeout(30000);

    temp.mkdir("installer-", (err, path) => {
      tmpPath = path;
      done(err);
    });
  });

  describe("local pkg with redirects", () => {
    /**
     * Test a pkg that refers to linked packages
     */
    let testDir;

    async function mkLocalPiePackageWithRedirects(
      dir: string,
      name: string
    ): Promise<void> {
      await mkLocalPackage(dir, `scope-el`, { name: `@scope/el` });
      await mkLocalPackage(dir, `scope-controller`, {
        name: `@scope/controller`
      });
      await mkLocalPackage(dir, `scope-configure`, {
        name: `@scope/configure`
      });

      await mkLocalPackage(dir, name, {
        dependencies: {
          "@scope/configure": "../scope-configure",
          "@scope/controller": "../scope-controller",
          "@scope/el": "../scope-el"
        },
        name: `@scope/${name}`,
        pie: {
          configure: "@scope/configure",
          controller: "@scope/controller",
          element: "@scope/el"
        }
      });
    }

    let result: InstallResult;

    beforeAll(async () => {
      testDir = join(tmpPath, "redirect");
      await ensureDir(testDir);
      const dir = join(testDir, "local-redirect-test");
      await ensureDir(dir);
      await mkLocalPiePackageWithRedirects(testDir, "local-redirect");
      result = await install(
        dir,
        { "element-one": "../local-redirect" },
        [{ element: "element-one" }],
        reporter
      );
      return result;
    });

    it.only("has 1 result", () => {
      expect(result.pkgs.length).toEqual(1);
    });

    describe("result", () => {
      let one;

      beforeAll(() => {
        one = result.pkgs[0];
      });

      it("returns input pkg", () =>
        expect(one.input).toMatchObject({
          element: "element-one",
          value: "../local-redirect"
        }));

      it("returns element ", () =>
        expect(one.element).toMatchObject({
          moduleId: "@scope/el",
          tag: "element-one"
        }));

      it("returns configure", () =>
        expect(one.configure).toMatchObject({
          dir: "./../../scope-configure",
          moduleId: "@scope/configure",
          tag: "element-one-configure"
        }));

      it("configure dir exists", async () => {
        const exists = await pathExists(
          resolve(result.dirs.root, one.configure.dir)
        );
        expect(exists).toBeTruthy();
      });

      it("returns controller", () =>
        expect(one.controller).toMatchObject({
          key: "element-one-controller",
          moduleId: "@scope/controller"
        }));
    });
  });
});
