// Test script to verify the add account API integration
import { accountsApi } from '../lib/api/accounts';

async function testAddAccount() {
  try {
    console.log('Testing add account API integration...');

    // Test with a unique account name
    const testAccountName = `test_account_${Date.now()}`;
    console.log(`Attempting to create account: ${testAccountName}`);

    const result = await accountsApi.addAccount(testAccountName);
    console.log('Success:', result);

    // Verify account was created by listing accounts
    const accounts = await accountsApi.listAccounts();
    console.log('Current accounts:', accounts);

    if (accounts.includes(testAccountName)) {
      console.log('✅ Account creation verified!');
    } else {
      console.log('❌ Account not found in list');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Only run in browser environment
if (typeof window !== 'undefined') {
  // Wait for DOM to load
  document.addEventListener('DOMContentLoaded', () => {
    testAddAccount();
  });
} else {
  // For Node.js environment
  testAddAccount();
}
