import { type PluginOption } from "vite";

import { resolve } from "path";
import { exec } from "child_process";

const themePath = resolve("./src/constants/theme.constant.ts");

const watchTheme: () => PluginOption = () => ({
  name: "watch-and-run",
  async configureServer(server) {
    server.watcher.on("change", (e) => {
      if (e !== themePath) return;
      exec("npm run type:theme", (err, stdout) => {
        if (err) console.error(err);
        if (stdout) console.log(stdout);
      });
    });
  },
});

export default watchTheme;
