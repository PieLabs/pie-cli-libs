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

export type PieInfo = {
  hasConfigurePackage: boolean,
  controller?: { dir: string, moduleId: string },
  configure?: { dir: string, moduleId: string }
};

export interface CustomElementToModuleId {
  /** valid custom element name */
  tag: string;
  /** the require path that containes the element as a default export */
  moduleId: string;

  /** the dir in which to resolve the `moduleId` */
  dir: string;
}

export interface Element {
  tag: string;
  moduleId: string;
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

export type Package = {
  name: string,
  version: string,
  dependencies?: { [key: string]: string }
};
