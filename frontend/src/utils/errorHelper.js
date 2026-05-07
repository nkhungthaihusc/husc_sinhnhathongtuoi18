/**
 * Extracts and formats error messages from API responses to be user-friendly
 */
export const getErrorMessage = (error, defaultMessage = 'Có lỗi xảy ra. Vui lòng thử lại.') => {
  // Handle error response from API
  const backendMessage = error?.response?.data?.message;
  if (backendMessage) {
    // Map specific backend error messages to user-friendly messages
    const errorMap = {
      'Unauthorized': 'Vui lòng đăng nhập lại',
      'Forbidden': 'Bạn không có quyền thực hiện thao tác này',
      'Not found': 'Dữ liệu không tồn tại',
      'Invalid': 'Dữ liệu không hợp lệ',
      'Conflict': 'Dữ liệu xung đột',
      'validation failed': 'Dữ liệu nhập vào không hợp lệ',
      'already exists': 'Dữ liệu này đã tồn tại',
      'không hợp lệ': backendMessage, // Vietnamese messages, keep as-is
      'không thể': backendMessage,
      'Không': backendMessage,
    };

    // Check if the backend message matches any known error patterns
    for (const [pattern, friendlyMsg] of Object.entries(errorMap)) {
      if (backendMessage.toLowerCase().includes(pattern.toLowerCase())) {
        return friendlyMsg;
      }
    }

    // If it's already a Vietnamese friendly message, use it
    if (backendMessage.toLowerCase().includes('không') || 
        backendMessage.toLowerCase().includes('hủy') ||
        backendMessage.toLowerCase().includes('đăng')) {
      return backendMessage;
    }

    // Default to backend message if it seems user-friendly
    return backendMessage;
  }

  // Handle network errors
  if (error?.message === 'Network Error' || !error?.response) {
    return 'Lỗi kết nối. Vui lòng kiểm tra kết nối internet.';
  }

  // Handle specific HTTP status codes
  const status = error?.response?.status;
  const statusMap = {
    400: 'Yêu cầu không hợp lệ',
    401: 'Phiên đăng nhập đã hết hạn',
    403: 'Bạn không có quyền thực hiện thao tác này',
    404: 'Dữ liệu không tìm thấy',
    409: 'Xung đột dữ liệu',
    422: 'Dữ liệu không hợp lệ',
    429: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
    500: 'Lỗi hệ thống, vui lòng thử lại sau',
    503: 'Dịch vụ tạm thời không hoạt động',
  };

  if (statusMap[status]) {
    return statusMap[status];
  }

  return defaultMessage;
};

/**
 * Extracts success message from API response
 */
export const getSuccessMessage = (response, defaultMessage = 'Thao tác thành công') => {
  return response?.data?.message || defaultMessage;
};
