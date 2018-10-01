import RegClient from "npm-registry-client";
import semver from "semver";
import debug from "debug";

const log = debug("pie-cli-libs:registry");

export const getNameVersion = (
  n: string
): { name: string; version: string; isRange: boolean } => {
  const index = n.lastIndexOf("@");
  if (index !== 0 && index !== -1) {
    const version = n.substr(index + 1);
    return {
      isRange: semver.validRange(version) !== version,
      name: n.substr(0, index),
      version
    };
  } else {
    return {
      isRange: false,
      name: n,
      version: "latest"
    };
  }
};

export default class Registry {
  private client: RegClient;

  constructor(readonly uri: string = "https://registry.npmjs.org") {
    this.client = new RegClient({});
  }

  public async tarball(nameVersion: string) {
    const nv = getNameVersion(nameVersion);

    log("nv: ", nv);
    const pkgInfo = await this.info(nv.name);

    log("pkgInfo: ", pkgInfo);

    if (nv.version === "latest") {
      nv.version = pkgInfo["dist-tags"].latest;
      nv.isRange = false;
    }
    const versions = Object.keys(pkgInfo.versions);

    log("versions: ", versions, semver.maxSatisfying(versions, nv.version));

    const version = nv.isRange
      ? semver.maxSatisfying(versions, nv.version)
      : nv.version;

    log("version: ", version);
    return pkgInfo.versions[version].dist.tarball;
  }

  private info(name: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const fullPath = `${this.uri}/${name}`;
      log(`>> full path: ${fullPath}`);

      this.client.get(fullPath, { timeout: 4000 }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}
