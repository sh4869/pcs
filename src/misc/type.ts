import { SemVer } from "semver";

export type DependecyRange = string;

/**
 * パッケージの依存関係
 */
export type Dependencies = { [name: string]: DependecyRange };

/**
 * あるパッケージにおけるバージョンとそのバージョンの依存関係
 */
export type PackageDependenciesInfo = Map<SemVer, Dependencies>;

export interface LogicalTree {
  name: string;
  version: string;
  address: string;
  optional: boolean;
  dev: boolean;
  bundled: boolean;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  resolved: any;
  integrity: any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  dependencies: Map<string, LogicalTree>;
  requiredBy?: Set<LogicalTree>;
}

export interface Package {
  name: string;
  version: SemVer;
}

export const ROOT_PROJECT: Package = {
  name: "#ROOT_PROJECT",
  version: new SemVer("0.0.0")
};

export interface DependencyRoot {
  // プロジェクトから見て上から下に下がっていく
  root: Package[];
}

/**
 * 衝突したパッケージとその原因
 */
export interface ConflictPackage {
  packageName: string;
  versions: { version: SemVer; depenedecyRoot: Package[] }[];
}
/**
 * Conflictの存在をチェックしたあとのデータ
 */
export type ConflictPackages = ConflictPackage[];

/**
 * Conflictをチェックする機構
 */
export interface ConflictChecker {
  checkConflict: (logicalTree: Map<string, LogicalTree>) => ConflictPackages;
}
