import { hash } from "../index";

describe("hash", () => {
  const assert = (nv, expected) => {
    it(`hashes ${JSON.stringify(nv)} to: ${expected}`, () => {
      expect(hash(nv)).toEqual(expected);
    });
  };
  assert([{ name: "a", version: "1.0.0" }], "2067447318");

  assert(
    [{ name: "@pie-element/multiple-choice", version: "2.0.2" }],
    "292323298"
  );

  it("throws an error if there are duplicate names", () => {
    expect(() =>
      hash([{ name: "a", version: "1" }, { name: "a", version: "2" }])
    ).toThrowError();
  });

  it("throws an error is nameVersions is empty", () => {
    expect(() => hash([])).toThrowError();
  });

  it("throws an error is nameVersions is undefined", () => {
    expect(() => hash(undefined)).toThrowError();
  });
});
