import { program as cli } from "@caporal/core";
import { banner, box } from "./ui";
import crypto from "node:crypto";
import pkg from "../package.json" assert { type: "json" };
const open = require("open");
const { spawn } = require("node:child_process");
const jsdom = require("jsdom"); // jsdom must be included commonjs style (with require)
// @ts-ignore
import PKLib from "@publishkit/pklib";

try {
  const pklib = new PKLib();
  if (pklib.error) throw new Error(pklib.error.message || pklib.error);

  const isReady = () => {
    return !!pklib.env.type;
  };

  const noContext = (logger: any) => {
    logger.error("command must be run in a publishkit folder");
  };

  // bind nodejs crypto lib
  pklib.utils.c.setLib(crypto.webcrypto);

  cli
    .name(`PublishKit CLI v${pkg.version}`)
    .description("A program that does something.")

    .action(({ logger, args }) => {
      if (!pklib.pkrc) {
        logger.info("no pkrc file found");
        logger.info('run "pk init" to create a new vault');
        return;
      }
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
    .option("-d, --dry", "dry run")
    .option("-f, --follow", "follow links")
    .option("-i, --inspect", "log parser cache")
    .action(async ({ logger, args, options }) => {
      pklib.parser.jsdom = jsdom;
      const opt = {
        dry: options.dry || false,
        follow: options.follow || false,
        inspect: options.inspect || false,
      };
      if (opt.dry) logger.info(`dry run`);
      const result = await pklib.exportFile(args.files, opt);
      console.log(result.summary);
    })

    .command("render", "render file")
    .argument("<file>", "arg")
    .option("--html", "print html only")
    .action(async ({ logger, args, options }) => {
      pklib.parser.jsdom = jsdom;
      const opt = {};
      const result = await pklib.parser.parseMD(args.file, opt);
      const print = options.html ? result.html : result;
      console.log(print);
    })

    // .command("searchdb", "build search index")
    // .action(async ({ logger, args, options }) => {
    //   // bind domparser
    //   pklib.parser.domParser = new jsdom.JSDOM().window.DOMParser;
    //   const result = await pklib.buildSearch();
    //   console.log(result);
    // })

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
    })

    .command("serve", "serve site on localhost")
    .option("-p, --port", "port (default 3000")
    .action(async ({ logger, args, options }) => {
      // if (!isReady()) return noContext(logger);
      const port = options.port || "3000";
      const server = spawn("npx", ["http-server", "-p", port], {
        cwd: pklib.env.kit,
        stdio: "pipe",
      });

      let i = 0;
      server.stdout.on("data", () => {
        if (i != 0) return;
        i++;
        const url = `http://localhost:${port}`;
        logger.info(`publishkit running at ${url}`);
        logger.info(`press ctrl + c to stop serving`);
        open(url);
      });
    });

  cli.run();
} catch (e) {
  console.log(`[error 💥]`, e.message || e);
}
