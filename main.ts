#!/usr/bin/env -S deno run -A
import { parseArgs } from "node:util";
import * as esbuild from "npm:esbuild@0.24.2";
if (Deno.args.length === 0) {
  console.error("Usage: host-script <target.ts>");
  Deno.exit(1);
}

const parsed = parseArgs({
  args: Deno.args,
  options: {
    port: {
      type: "string",
      alias: "p",
    },
  },
  allowPositionals: true,
});

const targetPath = parsed.positionals[0];
const port = parsed.values.port ? Number(parsed.values.port) : 9999;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Content-Type": "application/javascript",
};

let currentCode = "";
let _resolve: () => void;
const firstBuildPromise = new Promise<void>((resolve) => {
  _resolve = resolve;
});

const ctx = await esbuild.context({
  entryPoints: [targetPath],
  bundle: true,
  format: "esm",
  write: false,
  platform: "browser",
  outfile: "bundle.js",
  plugins: [
    {
      name: "onRebuild",
      setup(build) {
        build.onEnd((result) => {
          currentCode = result.outputFiles?.[0]?.text ?? "";
          console.log(`[${new Date().toLocaleTimeString()}] Build successful`);
          _resolve();
        });
      },
    },
  ],
});

ctx.watch({});
ctx.rebuild();

Deno.serve(
  {
    port,
    onListen: () => {
      console.log(
        `[Browser] await import("http://localhost:${port}/?"+Math.random())`
      );
      console.log(
        `[Bookmarklet] javascript:import("http://localhost:${port}/?"+Math.random())`
      );
    },
  },
  async (req: Request): Promise<Response> => {
    await firstBuildPromise;
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    return new Response(currentCode, { headers: corsHeaders });
  }
);
