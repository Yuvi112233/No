// User-friendly error messages for different error types

export interface ErrorInfo {
  title: string;
  message: string;
  action: string;
  icon: string;
}

export const ERROR_MESSAGES: Record<string, ErrorInfo> = {
  'REQUEST_TIMEOUT': {
    title: 'Server is taking too long',
    message: 'The server is not responding. This might be due to high traffic or server maintenance.',
    action: 'Retry',
    icon: '⏱️'
  },
  'NO_INTERNET': {
    title: 'No internet connection',
    message: 'Please check your internet connection and try again.',
    action: 'Retry',
    icon: '📡'
  },
  'NETWORK_ERROR': {
    title: 'Network error',
    message: 'Unable to reach the server. Please check your connection or try again later.',
    action: 'Retry',
    icon: '🌐'
  },
  'CORS_ERROR': {
    title: 'Access denied',
    message: 'Unable to connect to the server. Please contact support if this persists.',
    action: 'Contact Support',
    icon: '🚫'
  },
  'SERVER_ERROR': {
    title: 'Server error',
    message: 'Something went wrong on our end. Our team has been notified.',
    action: 'Retry',
    icon: '⚠️'
  },
  'UNKNOWN_ERROR': {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
    action: 'Retry',
    icon: '❌'
  }
};

export function getErrorMessage(error: any): ErrorInfo {
  // Check for custom error codes
  if (error.message && ERROR_MESSAGES[error.message]) {
    return ERROR_MESSAGES[error.message];
  }
  
  // Check for specific error patterns
  if (error.message?.includes('timeout') || error.name === 'AbortError') {
    return ERROR_MESSAGES['REQUEST_TIMEOUT'];
  }
  
  if (error.message?.includes('CORS')) {
    return ERROR_MESSAGES['CORS_ERROR'];
  }
  
  if (error.message?.includes('Failed to fetch')) {
    if (!navigator.onLine) {
      return ERROR_MESSAGES['NO_INTERNET'];
    }
    return ERROR_MESSAGES['NETWORK_ERROR'];
  }
  
  if (error.message?.includes('API Error 5')) {
    return ERROR_MESSAGES['SERVER_ERROR'];
  }
  
  // Default error
  return ERROR_MESSAGES['UNKNOWN_ERROR'];
}

export function formatErrorForUser(error: any): string {
  const errorInfo = getErrorMessage(error);
  return `${errorInfo.icon} ${errorInfo.title}: ${errorInfo.message}`;
}
