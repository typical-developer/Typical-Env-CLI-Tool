#!/usr/bin/env node
import { execSync } from "child_process";
import degit from "degit";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log(
chalk.cyanBright(`
╭──────────────────────────────────────────────────────────────╮
│                                                              │
│                Typical Env Project Setup Tool                │
│                                                              │
│   Instantly sets up a modern React environment with:         │
│                                                              │
│   • React – JavaScript library for building UIs              │
│   • Vite – Next-generation frontend tooling                  │
│   • Tailwind CSS – Utility-first CSS framework               │
│   • CLSX – Conditional className utility                     │
│   • Tailwind Merge – Smart merge for Tailwind classes        │
│   • React Router / DOM – Declarative routing for React       │
│   • Boxicons – Beautiful icon library                        │
│   • CSS AOS – Animate On Scroll library                      │
│   • Shadcn UI – Reusable components                          │
│   • React Bits – Reusable React components & hooks           │
│                                                              │
│      Create it all instantly with one simple command.        │
│                                                              │
╰──────────────────────────────────────────────────────────────╯
`)
  );

  // Step 1: Ask for project name
  const { projectName } = await prompts({
    type: "text",
    name: "projectName",
    message: "Project name:",
    initial: "typical-env-app",
  });

  let name = projectName.trim();
  const inCurrent = name === ".";
  const targetDir = inCurrent ? process.cwd() : path.resolve(process.cwd(), name);

  if (!inCurrent && fs.existsSync(targetDir)) {
    console.log(chalk.red(`\n Directory "${name}" already exists.`));
    process.exit(1);
  }

  // Use current directory name if "." is provided
  const finalName = inCurrent ? path.basename(process.cwd()) : name;

  // Step 2: Clone template
  const cloneSpinner = ora("Cloning Typical Env template...").start();

  const emitter = degit("typical-developer/typical-env", {
    cache: false,
    force: true,
  });

  try {
    await emitter.clone(targetDir);
    cloneSpinner.succeed("Template cloned successfully!");
  } catch (error) {
    cloneSpinner.fail("Failed to clone template.");
    console.error(error);
    process.exit(1);
  }

  // Step 3: Install dependencies
  const installSpinner = ora("Installing dependencies...").start();
  try {
    execSync("npm install", { cwd: targetDir, stdio: "inherit" });
    installSpinner.succeed("Dependencies installed!");
  } catch (error) {
    installSpinner.fail("Failed to install dependencies.");
    console.error(error);
    process.exit(1);
  }

  // Step 4: Update package.json name if cloning into "."
  const pkgPath = path.join(targetDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.name = finalName;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  }

  // Step 5: Success message
  console.log(chalk.greenBright(`\n Setup complete!`));
  console.log(chalk.white(`\nNext steps:`));
  if (!inCurrent) console.log(chalk.gray(`  cd ${finalName}`));
  console.log(chalk.gray(`  npm run dev\n`));
}

main().catch((err) => {
  console.error(chalk.red("Unexpected error:"), err);
  process.exit(1);
});
