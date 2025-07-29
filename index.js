import { spawn } from "child_process";

(function start() {
  const child = spawn(process.argv0, ["main.js", ...process.argv.slice(2)], {
    stdio: ["inherit", "inherit", "inherit", "ipc"],
  })
    .on("message", (msg) => {
      if (msg.toLowerCase() == "restart") {
        child.kill();
        child.once("exit", start);
      }
    })
    .on("exit", (code) => {
      if (code) child.once("close", start);
    })
    .on("error", console.log);
})();
