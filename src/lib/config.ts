// Runtime configuration
let runtimeConfig: {
  API_BASE_URL: string;
} | null = null;

// Configuration loading state
let configLoading = true;

// Default fallback configuration
const defaultConfig = {
  API_BASE_URL: 'http://127.0.0.1:5000',
};

export async function loadRuntimeConfig(): Promise<void> {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        runtimeConfig = await response.json();
      }
    }
  } catch (error) {
    // Silently fail and use default config
  } finally {
    configLoading = false;
  }
}

export function getConfig() {
  if (configLoading) {
    return defaultConfig;
  }

  if (runtimeConfig) {
    return runtimeConfig;
  }

  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    const nextConfig = {
      API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    };
    return nextConfig;
  }

  return defaultConfig;
}

export function getAPIBaseURL(): string {
  const baseURL = getConfig().API_BASE_URL;
  if (baseURL === '/') {
    return '';
  }
  return baseURL;
}

export const config = {
  get API_BASE_URL() {
    return getAPIBaseURL();
  },
};