import * as _ from "lodash";

const hashCode = (str: string): string => {
  console.log("str: ", str);
  let res = 0;
  const len = str.length;
  for (let i = 0; i < len; i++) {
    res = res * 31 + str.charCodeAt(i);
    // tslint:disable-next-line:no-bitwise
    res = res & res;
  }
  return res.toString();
};

export const hash = (
  nameVersions: { name: string; version: string }[]
): string => {
  if (!nameVersions) {
    throw new Error("nameVersions is undefined");
  }

  if (!Array.isArray(nameVersions)) {
    throw new Error("nameVersions must be an array of {name,version}");
  }

  if (nameVersions.length === 0) {
    throw new Error("nameVersions must be a non empty array of {name,version}");
  }

  const unique = _.uniqBy(nameVersions, "name");

  if (unique.length !== nameVersions.length) {
    throw new Error("Duplicate names found in array.");
  }

  const sorted = _.sortBy(unique, "name");
  const string = sorted.map(nv => `${nv.name}@${nv.version}`).join(",");
  console.log("string: ", string);
  return hashCode(string);
};
