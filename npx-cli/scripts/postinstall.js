#!/usr/bin/env node

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║  ✅ Hummingbot Dashboard installed successfully!       ║${colors.reset}`);
console.log(`${colors.cyan}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

console.log(`${colors.green}Get started:${colors.reset}`);
console.log(`  1. Make sure Hummingbot is running with API enabled`);
console.log(`  2. Run: ${colors.yellow}npx hummingbot-dashboard${colors.reset}`);
console.log(`  3. Open: ${colors.yellow}http://localhost:3002${colors.reset}\n`);

console.log(`${colors.green}Configuration:${colors.reset}`);
console.log(`  • Custom port: ${colors.yellow}npx hummingbot-dashboard --port=4000${colors.reset}`);
console.log(`  • Custom API: ${colors.yellow}HUMMINGBOT_API_PORT=9000 npx hummingbot-dashboard${colors.reset}\n`);

console.log(`${colors.green}Documentation:${colors.reset}`);
console.log(`  📖 Visit: https://github.com/your-org/hummingbot-dashboard\n`);