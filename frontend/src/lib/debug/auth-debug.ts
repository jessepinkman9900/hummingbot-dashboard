import { getBaseURLFromHealthMonitor } from '@/lib/api/client';

// Debug utility to check auth state
export function debugAuthState() {
  console.log('=== Auth Debug Info ===');

  const selectedUrlId = localStorage.getItem('healthMonitorSelectedUrl');
  const savedUrls = localStorage.getItem('healthMonitorUrls');

  console.log('Selected URL ID:', selectedUrlId);
  console.log('Saved URLs:', savedUrls);

  if (selectedUrlId && savedUrls) {
    try {
      const urls = JSON.parse(savedUrls);
      const selectedUrl = urls.find((url: any) => url.id === selectedUrlId);
      console.log('Selected URL Object:', selectedUrl);

      if (selectedUrl?.username && selectedUrl?.password) {
        console.log('Auth credentials found:', {
          username: selectedUrl.username,
          password: selectedUrl.password ? '***' : 'empty',
          hasPassword: !!selectedUrl.password,
        });

        // Test basic auth header generation
        const credentials = btoa(
          `${selectedUrl.username}:${selectedUrl.password}`
        );
        console.log('Generated auth header:', `Basic ${credentials}`);
      } else {
        console.log('No auth credentials found');
      }
    } catch (error) {
      console.error('Error parsing saved URLs:', error);
    }
  } else {
    console.log('No saved URL configuration found');
  }

  console.log('======================');
}

// Function to test API call with auth
export async function testApiAuth() {
  const baseURL = getBaseURLFromHealthMonitor();
  try {
    const response = await fetch(`${baseURL}/accounts/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    console.log('API Test without auth:', response.status, response.statusText);
  } catch (error) {
    console.log('API Test without auth failed:', error);
  }

  // Test with auth from localStorage
  const selectedUrlId = localStorage.getItem('healthMonitorSelectedUrl');
  const savedUrls = localStorage.getItem('healthMonitorUrls');

  if (selectedUrlId && savedUrls) {
    try {
      const urls = JSON.parse(savedUrls);
      const selectedUrl = urls.find((url: any) => url.id === selectedUrlId);

      if (selectedUrl?.username && selectedUrl?.password) {
        const credentials = btoa(
          `${selectedUrl.username}:${selectedUrl.password}`
        );
        const response = await fetch(`${baseURL}/accounts/`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Basic ${credentials}`,
          },
        });
        console.log(
          'API Test with auth:',
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.log('API Test with auth failed:', error);
    }
  }
}
