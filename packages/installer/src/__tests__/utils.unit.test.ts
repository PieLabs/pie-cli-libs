import { versionFromValue } from "../utils";

describe("versionFromValue", () => {
  const assert = (input, expected) => {
    it(`${input} -> ${expected}`, () => {
      expect(versionFromValue(input)).toEqual(expected);
    });
  };

  assert("a@1.0.0", "1.0.0");
  assert("a@^1.0.0", "^1.0.0");
  assert("a@~1.0.0", "~1.0.0");
  assert("@scope/name@~1.0.0", "~1.0.0");
  assert("a", "latest");
});
