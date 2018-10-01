import Registry from "../registry";

describe("registry", () => {
  const assertTarball = (name, endsWith) => {
    it(`handles ${name}`, async () => {
      const r = new Registry("http://localhost:4873");

      const tb = await r.tarball(name);
      expect(tb.endsWith(endsWith)).toEqual(true);
    });
  };

  assertTarball("@pie-test-elements/element", "element-0.0.1.tgz");
  assertTarball("@pie-test-elements/element@latest", "element-0.0.1.tgz");
  assertTarball("@pie-test-elements/element@0.0.x", "element-0.0.1.tgz");
  assertTarball("@pie-test-elements/element@^0.0.1", "element-0.0.1.tgz");
});
