/** Returns the first error message string from an Axios error response. */
export function getApiError(err) {
  const errors = err?.response?.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    return errors[0].message || 'An error occurred';
  }
  return err?.message || 'An error occurred';
}

/** Returns a map of field -> message for inline field errors. */
export function getFieldErrors(err) {
  const errors = err?.response?.data?.errors;
  if (!Array.isArray(errors)) return {};
  return errors.reduce((acc, e) => {
    if (e.field) acc[e.field] = e.message;
    return acc;
  }, {});
}

