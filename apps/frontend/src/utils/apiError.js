export function getApiErrorMessage(error, fallbackMessage = "Something went wrong.") {
  if (error?.response?.status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (error?.response?.status === 401) {
    return "Your session expired. Please log in again.";
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallbackMessage
  );
}