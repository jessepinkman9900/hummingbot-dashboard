#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const http = require("http");
const fs = require("fs");

// Parse command line arguments
const args = process.argv.slice(2);
const portArg = args.find((arg) => arg.startsWith("--port="));
const apiUrlArg = args.find((arg) => arg.startsWith("--api-url="));

// Parse port (default: 3002)
const PORT = portArg ? parseInt(portArg.split("=")[1]) : 3002;

// Parse API URL (default: http://localhost:8000)
const API_URL = apiUrlArg ? apiUrlArg.split("=")[1] : "http://localhost:8000";

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
  log(
    "  --api-url=<url>              Hummingbot API URL (default: http://localhost:8000)",
    colors.yellow
  );
  log("  --help                       Show this help message\n", colors.yellow);
  log("Environment Variables:");
  log(
    "  PORT                        Dashboard port (default: 3002)\n",
    colors.yellow
  );
  log("Examples:");
  log("  npx hummingbot-dashboard", colors.blue);
  log("  npx hummingbot-dashboard --port=4000", colors.blue);
  log(
    "  npx hummingbot-dashboard --api-url=http://localhost:9000",
    colors.blue
  );
  log(
    "  npx hummingbot-dashboard --port=4000 --api-url=http://api.example.com:8080\n",
    colors.blue
  );
}

// Check if help flag is present
if (args.includes("--help") || args.includes("-h")) {
  showBanner();
  showHelp();
  process.exit(0);
}

function checkHummingbotAPI() {
  return new Promise((resolve) => {
    const req = http.get(`${API_URL}/connectors/`, (res) => {
      resolve(res.statusCode === 200);
    });

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
  log(`   Hummingbot API: ${API_URL}\n`, colors.green);

  // Check if Hummingbot API is running
  log("🔍 Checking Hummingbot API connection...", colors.yellow);
  const apiAvailable = await checkHummingbotAPI();

  if (!apiAvailable) {
    log("⚠️  Warning: Cannot connect to Hummingbot API", colors.yellow);
    log(`   Make sure Hummingbot is running on ${API_URL}`, colors.yellow);
    log(
      "   Dashboard will start anyway, but features may not work.\n",
      colors.yellow
    );
  } else {
    log("✅ Hummingbot API is accessible\n", colors.green);
  }

  log("🚀 Starting dashboard server...", colors.cyan);
  log("⏳ Please wait while the server initializes...\n", colors.cyan);

  // Start Next.js production server (standalone build)
  const standaloneServer = path.join(
    distDir,
    ".next",
    "standalone",
    "server.js"
  );
  let command, args;

  try {
    fs.accessSync(standaloneServer);
    // Use the standalone server for production
    command = "node";
    args = [standaloneServer];
  } catch {
    // Standalone server not found - this is a critical error
    log("❌ Standalone server not found!", colors.red);
    log(`   Expected: ${standaloneServer}`, colors.yellow);
    log("   This package requires a pre-built Next.js standalone application.", colors.yellow);
    log("   Please ensure the package was built correctly with 'output: standalone' configuration.\n", colors.yellow);
    process.exit(1);
  }

  const server = spawn(command, args, {
    cwd: distDir,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: PORT.toString(),
      HOSTNAME: "0.0.0.0",
      NEXT_PUBLIC_API_BASE_URL: API_URL,
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
