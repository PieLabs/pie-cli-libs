import NewInstaller from "../new-installer";
import { mkdirAsync } from "./utils";
import { buildLogger } from "log-factory";

let elements: { [key: string]: string } = {
  "first-class": "@pie-test-elements/first-class-pie@0.1.2"
};

const models = [
  {
    element: "first-class"
  }
];

const reporter = {
  info: jest.fn(),
  promise: jest.fn().mockReturnValue({})
};

let dir;

const logger = buildLogger();

describe("new installer", () => {
  beforeAll(async () => {
    dir = await mkdirAsync("new-installer");
    logger.info("run install...");
  });
  it("gets the info", async () => {
    const i = new NewInstaller(dir, reporter, "http://localhost:4873");
    await i.install(elements, models);
    console.log("done");
  });
});

describe.only("element with internals", () => {
  beforeAll(async () => {
    elements = {
      "with-internals": "@pie-test-elements/element-with-internals"
    };

    dir = await mkdirAsync("new-installer");
    logger.info("run install...");
    const i = new NewInstaller(dir, reporter, "http://localhost:4873");
    await i.install(elements, models);
    console.log("done");
  });
  it("installs", () => {
    console.log("done");
  });
});
