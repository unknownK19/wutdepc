#!/usr/bin/env node

// window resize
process.stdout.write("\x1b[8;27;80t");

// imports
const os = require("os");
const sysinfo = require("systeminformation");
const fs = require("fs");
const osReleasePath = "/etc/os-release";

// consts for functions
const totalMem = os.totalmem() / 1073741824;
const memInfo = fs.readFileSync("/proc/meminfo", "utf-8");
const match = memInfo.match(/^MemAvailable:\s+(\d+)/m);
const freeMem = (match ? parseInt(match[1], 10) * 1024 : 0) / 1073741824;
const usedMem = totalMem - freeMem;
const uptime = os.uptime();

const date = new Date(uptime * 1000);

const days = Math.floor(uptime / 86400);
const hours = date.getUTCHours();
const minutes = date.getUTCMinutes();

// clear console function
function clearConsole() {
  if (process.platform === "darwin") {
    console.log("\x1Bc");
  } else if (process.platform === "win32") {
    console.log("\x1B[2J\x1B[0;0H");
  } else {
    console.log("\x1B[2J\x1B[0;0H");
  }
}

// get sys info function
async function getSystemInfo() {
  try {
    const data = await sysinfo.osInfo();
    const platform = data.distro === "macOS" ? "macOS" : data.platform;
    const osInfo = `${platform} ${data.release}`;

    if (os.platform() === "linux") {
      const osReleaseContent = fs.readFileSync(osReleasePath, "utf8");
      const osReleaseLines = osReleaseContent.split("\n");
      const osInfoLinux = {};

      osReleaseLines.forEach((line) => {
        const parts = line.split("=");
        if (parts.length === 2) {
          const key = parts[0].trim();
          const value = parts[1].trim().replace(/"/g, "");
          osInfoLinux[key] = value;
        }
      });

      const cpuArch = os.arch();
      const archMap = {
        arm64: "arm64",
        arm: "arm",
        x64: "amd64",
        ia32: "amd32",
      };
      const arch = archMap[cpuArch] || cpuArch;

      return `${osInfoLinux.ID} ${osInfoLinux.VERSION_ID} (${arch})`;
    } else {
      return osInfo;
    }
  } catch (error) {
    throw error;
  }
}

// get DE function
function getDesktopEnvironment() {
  if (process.env.XDG_CURRENT_DESKTOP) {
    return process.env.XDG_CURRENT_DESKTOP;
  } else if (process.env.GNOME_DESKTOP_SESSION_ID) {
    return "GNOME";
  } else if (process.env.KDE_FULL_SESSION) {
    return "KDE";
  } else if (process.env.WINDOWS_DESKTOP_SESSION_ID) {
    return "Windows Desktop";
  } else if (process.platform === "darwin") {
    return "Aqua";
  } else {
    return "Unknown";
  }
}

// fet Shell function
function getShell() {
  const shell = process.env.SHELL;
  if (shell.includes("bash")) {
    return "bash";
  } else if (shell.includes("zsh")) {
    return "zsh";
  } else if (shell.includes("fish")) {
    return "fish";
  } else if (shell.includes("tcsh")) {
    return "tcsh";
  } else {
    return "Unknown";
  }
}

// main function
async function main() {
  clearConsole();

  // first 3 lines is waitersfor full info is ready
  sysinfo.graphics().then((data) => {
    sysinfo.fsSize().then((fsData) => {
      getSystemInfo().then((osInfo) => {
        // consts for main
        const stats = fs.statfsSync("/");
        const total = stats.blocks * stats.bsize;
        const available = stats.bfree * stats.bsize;
        const used = total - available;

        const totalGB = (total / 1073741824).toFixed(2);
        const usedGB = (used / 1073741824).toFixed(2);
        const usePercent = ((used / total) * 100).toFixed(2);
        const width = process.stdout.columns;
        const isMac = process.platform === "darwin";
        const space = isMac ? "\u00A0" : " ";
        const lang = Intl.DateTimeFormat().resolvedOptions().locale;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // printing sys info
        console.log(
          `\x1b[34m❯ wutdepc\x1b[0m\x1b[37m | \x1b[0m\x1b[32m${os.userInfo().username}@${os.hostname()}\x1b[0m\x1b[37m | \x1b[33mby Fynjirby\x1b[0m\n`,
        );
        console.log(`\x1b[31m${"=".repeat(width)}\x1b[0m\n`);
        console.log(`${space}📊${space}Operating System: ${osInfo}`);
        try {
          console.log(`${space}💻${space}CPU: ${os.cpus()[0].model}`);
        } catch (_) {
          console.log(`${space}💻${space}CPU: Unknown`);
        }
        try {
          console.log(`${space}🎥${space}GPU: ${data.controllers[0].model}`);
        } catch (_) {
          console.log(`${space}🎥${space}GPU: Unknown`);
        }
        console.log(`${space}🖥️${space}DE: ${getDesktopEnvironment()}`);
        console.log(`${space}⌨️${space}Terminal: ${getShell()}`);
        console.log(
          `${space}🧠${space}RAM: ${usedMem.toFixed(2)}GB/${totalMem.toFixed(
            2,
          )}GB`,
        );
        console.log(
          `${space}💾${space}Used Disk: ${usedGB}GB/${totalGB}GB (${usePercent}%)`,
        );
        console.log(`${space}📁${space}Current Directory: ${process.cwd()}`);
        console.log(
          `${space}⏳${space}Uptime: ${days} days, ${hours} hours, ${minutes} minutes`,
        );

        console.log(`${space}🌎${space}Language: ${lang}`);
        console.log(`${space}🕰️${space}Timezone: ${timezone}`);
        console.log(`${space}✅${space}Node.js Version: ${process.version}`);
        console.log(
          `${space}🧅${space}Bun.js Version: ${process.versions.bun}`,
        );
        console.log(`\n\x1b[31m${"=".repeat(width)}\x1b[0m`);

        // ip!herr ad btw :)
        console.log(`
  .--------------------------------------------.
  | Also try ip!herr: npmjs.com/package/ipherr |
  | Install: npm i -g ipherr                   |
  '--------------------------------------------'`);
        console.log("");
      });
    });
  });
}

main();
