#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const http = require("http");
const fs = require("fs");

// Parse command line arguments
const args = process.argv.slice(2);
const portArg = args.find((arg) => arg.startsWith("--port="));
const PORT = portArg
  ? parseInt(portArg.split("=")[1])
  : process.env.PORT || 3002;
const API_HOST = process.env.HUMMINGBOT_API_HOST || "localhost";
const API_PORT = process.env.HUMMINGBOT_API_PORT || 8000;

const distDir = path.join(__dirname, "..");

// Color codes for pretty output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function showBanner() {
  log(
    "\n╔════════════════════════════════════════════════════════╗",
    colors.cyan
  );
  log(
    "║                                                        ║",
    colors.cyan
  );
  log(
    "║         🐦 Hummingbot Dashboard v0.1.0                 ║",
    colors.cyan
  );
  log(
    "║                                                        ║",
    colors.cyan
  );
  log(
    "╚════════════════════════════════════════════════════════╝\n",
    colors.cyan
  );
}

function showHelp() {
  log("Usage: npx hummingbot-dashboard [options]\n", colors.bright);
  log("Options:");
  log(
    "  --port=<number>              Port to run dashboard (default: 3002)",
    colors.yellow
  );
  log("  --help                       Show this help message\n", colors.yellow);
  log("Environment Variables:");
  log(
    "  HUMMINGBOT_API_HOST         Hummingbot API host (default: localhost)",
    colors.yellow
  );
  log(
    "  HUMMINGBOT_API_PORT         Hummingbot API port (default: 8000)",
    colors.yellow
  );
  log(
    "  PORT                        Dashboard port (default: 3002)\n",
    colors.yellow
  );
  log("Examples:");
  log("  npx hummingbot-dashboard", colors.blue);
  log("  npx hummingbot-dashboard --port=4000", colors.blue);
  log("  HUMMINGBOT_API_PORT=9000 npx hummingbot-dashboard\n", colors.blue);
}

// Check if help flag is present
if (args.includes("--help") || args.includes("-h")) {
  showBanner();
  showHelp();
  process.exit(0);
}

function checkHummingbotAPI() {
  return new Promise((resolve) => {
    const req = http.get(
      `http://${API_HOST}:${API_PORT}/connectors/`,
      (res) => {
        resolve(res.statusCode === 200);
      }
    );

    req.on("error", () => {
      resolve(false);
    });

    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startDashboard() {
  showBanner();

  log("📊 Dashboard Configuration:", colors.bright);
  log(`   Dashboard URL: http://localhost:${PORT}`, colors.green);
  log(`   Hummingbot API: http://${API_HOST}:${API_PORT}\n`, colors.green);

  // Check if Hummingbot API is running
  log("🔍 Checking Hummingbot API connection...", colors.yellow);
  const apiAvailable = await checkHummingbotAPI();

  if (!apiAvailable) {
    log("⚠️  Warning: Cannot connect to Hummingbot API", colors.yellow);
    log(
      `   Make sure Hummingbot is running on http://${API_HOST}:${API_PORT}`,
      colors.yellow
    );
    log(
      "   Dashboard will start anyway, but features may not work.\n",
      colors.yellow
    );
  } else {
    log("✅ Hummingbot API is accessible\n", colors.green);
  }

  log("🚀 Starting dashboard server...", colors.cyan);
  log("⏳ Please wait while the server initializes...\n", colors.cyan);

  // Start Next.js production server
  // First try to use local next binary, fallback to npx next
  const localNextBin = path.join(distDir, "node_modules", ".bin", "next");
  let command, args;

  try {
    fs.accessSync(localNextBin);
    command = "node";
    args = [localNextBin, "start", "-p", PORT.toString()];
  } catch {
    // Fallback to npx next
    command = "npx";
    args = ["next", "start", "-p", PORT.toString()];
  }

  const server = spawn(command, args, {
    cwd: distDir,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
      NEXT_PUBLIC_API_HOST: API_HOST,
      NEXT_PUBLIC_API_PORT: API_PORT,
    },
  });

  server.on("error", (err) => {
    log("\n❌ Failed to start server:", colors.red);
    console.error(err);
    process.exit(1);
  });

  server.on("exit", (code) => {
    if (code !== 0) {
      log(`\n❌ Server exited with code ${code}`, colors.red);
    }
    process.exit(code || 0);
  });

  // Handle termination gracefully
  process.on("SIGINT", () => {
    log("\n\n👋 Shutting down dashboard...", colors.yellow);
    server.kill("SIGINT");
  });

  process.on("SIGTERM", () => {
    log("\n\n👋 Shutting down dashboard...", colors.yellow);
    server.kill("SIGTERM");
  });
}

// Start the dashboard
startDashboard().catch((err) => {
  log("\n❌ Fatal error:", colors.red);
  console.error(err);
  process.exit(1);
});
