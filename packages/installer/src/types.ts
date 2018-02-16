export enum PackageType {
  FILE = 'file',
  PACKAGE = 'package'
}

export type PiePackageConfig = {
  element?: string,
  controller?: string,
  configure?: string
};

export type Dirs = {
  configure: string,
  controllers: string,
  root: string
};

export type Input = {
  element: string,
  value: string
};

export type PreInstallRequest = {
  element: string,
  value: string,
  local: boolean,
  type: PackageType,
  hasModel: boolean,
  package?: { name: string }
};

export type PostInstall = {
  dir: string,
  moduleId: string,
  version: string,
  resolved: string,
  dependencies: { [key: string]: string }
};

export interface Element {
  tag: string;
  moduleId: string;
  isRootPkg: boolean;
  isLocalPkg: boolean;
  dir?: string;
}

export interface PieController {
  key: string;
  moduleId: string;
  /** Is the controller a child directory of the root pie pkg? */
  isChild: boolean;
  /** is the pkg local (and not a child)? */
  isLocalPkg: boolean;
  /** local path to pkg - if local */
  dir?: string;
}

export interface PieConfigure {
  tag: string;
  moduleId: string;
  /** Is the configure pkg a child directory of the root pie pkg? */
  isChild: boolean;
  /** is the pkg local (and not a child)? */
  isLocalPkg: boolean;
  /** local path to pkg - if local */
  dir: string;
}

export interface Pkg {
  input: Input;
  dir: string;
  isLocal: boolean;
  type: PackageType;
  rootModuleId: string;
  element: Element;
  controller?: PieController;
  configure?: PieConfigure;
}

export type ElementMap = {
  [key: string]: string
};

export type Model = {
  element: string
};

export type PackageJson = {
  name: string,
  version: string,
  dependencies?: { [key: string]: string }
};
