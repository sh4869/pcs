import { Command } from "commander";
import { NpmConflictChecker } from "./conflict_chekcer/npm_conflict_checker";
import { getLogicTree } from "./logic_tree";
import { NpmConflictSolver } from "./conflict_solver/npm_conflict_solver";
import { NpmPackageRepository } from "./get_package_info";
import { ConflictPackage, Package, NoConflictSituation } from "./type";
import chalk = require("chalk");

const pcc = new Command("pcc");

const printConflitResult = (conflictResult: ConflictPackage[]): void => {
  if (conflictResult.length > 0) {
    console.log(`find ${chalk.default.underline(conflictResult.length.toString())} conflicts package`);
    conflictResult.forEach(pack => {
      const groupByVersions: { [key: string]: Package[][] } = {};
      pack.versions.forEach(v => {
        if (groupByVersions[v.version.version]) groupByVersions[v.version.version].push(v.depenedecyRoot);
        else groupByVersions[v.version.version] = [v.depenedecyRoot];
      });
      console.log(chalk.default.green(`- ${pack.packageName}`));
      for (const ver in groupByVersions) {
        console.log(`    ${chalk.default.red(ver)}`);
        groupByVersions[ver].forEach(packages => {
          const space = 4;
          packages.forEach((pac, i) => {
            const prefix = `${" ".repeat(space + i * 2)}${i === 0 ? "  " : "+-"}`;
            const func =
              pac.name === pack.packageName && pac.version.version === ver
                ? chalk.default.bold
                : (str: string): string => str;
            console.log(prefix + func(pac.name + "@" + pac.version));
          });
        });
      }
    });
  } else {
    console.log(`no conflict.`);
  }
};

const printNoConflictSituation = (pack: ConflictPackage, situations: NoConflictSituation[]): void => {
  if (situations.length === 0) {
    console.log(chalk.default.red(`- ${pack.packageName}`));
    console.log(`    can't solve ${pack.packageName} conflict :(`);
  } else {
    console.log(chalk.default.green(`- ${pack.packageName}`));
    situations.forEach(situation => {
      console.log(
        `    ${chalk.default.bold(situation.targetPackage)}@${chalk.default.underline(situation.finalVersion.version)}`
      );
      situation.updateTargets.forEach(v => {
        const disp =
          v.before.version.version === v.after.version.version ? (str: string): string => str : chalk.default.bold;
        console.log(`      ${v.before.name}@${v.before.version} -> ${disp(`${v.after.name}@${v.after.version}`)}`);
      });
    });
  }
};

pcc.version("0.1.0");

pcc
  .command("check")
  .description("check conflict in package")
  .action((dir, _) => {
    const result = new NpmConflictChecker().checkConflict(getLogicTree(dir as string));
    printConflitResult(result);
  });

pcc
  .command("solve")
  .description("find slove conflict situatuion")
  .action(async (dir, _) => {
    const result = new NpmConflictChecker().checkConflict(getLogicTree(dir as string));
    const solver = new NpmConflictSolver(new NpmPackageRepository());
    result.forEach(async v => {
      printNoConflictSituation(v, await solver.solveConflict(v));
    });
  });

pcc.parse(process.argv);
