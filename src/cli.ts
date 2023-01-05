import { program as cli } from "@caporal/core";
import { banner, box } from "./ui";
import crypto from "node:crypto";
import pkg from "../package.json" assert { type: "json" };
// @ts-ignore
import PKLib from "@publishkit/pklib";

const jsdom = require("jsdom"); // jsdom must be included commonjs style (with require)
const pklib = new PKLib();

// bind nodejs crypto lib
pklib.utils.c.setLib(crypto.webcrypto);

cli
  .name(`PublishKit CLI v${pkg.version}`)
  .description("A program that does something.")

  .action(({ logger, args }) => {
    if (!pklib.pkrc) return logger.info('run "pk init" to create a new vault');
    banner(pklib);
  })

  .command("init", "init a publishkit vault")
  .action(async ({ logger, args }) => {
    await pklib.createPkrc();
    logger.info("pkrc.md created");
  })

  .command("ls", "list vault files")
  .action(async ({ logger, args }) => {
    if (!pklib.vault.base)
      throw new Error(`list works only on a "vault" folder`);
    const files = await pklib.vault.lsFiles();
    console.log(files);
  })

  .command("export", "export file(s)")
  .argument("<files...>", "arg")
  .option("-f, --follow", "follow links")
  .action(async ({ logger, args, options }) => {
    // bind domparser
    pklib.parser.domParser = new jsdom.JSDOM().window.DOMParser;
    const index = await pklib.exportFile(args.files, options.follow);
    console.log("exporting", index);
  })

  .command("utils", "run utils command")
  .argument("<name>", "command name - ex: a.asArray or c.encrypt")
  .argument("[args...]", "arg")
  .option("-a, --async", "require for async functions")
  .action(async ({ logger, args, options }) => {
    const { name, args: fnArgs = [] } = args;
    const fn = pklib.utils.o.get(pklib.utils, args.name as string);
    if (!fn) return logger.error("command %s not found", name);
    // @ts-ignore
    const result = options.async ? await fn(...fnArgs) : fn(...fnArgs);
    console.log(result);
  });

cli.run();
