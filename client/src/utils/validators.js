export function validateRegister({ name, email, password, confirmPassword }) {
  const errors = {};

  const trimmedName = (name || '').trim();
  if (!trimmedName) {
    errors.name = 'Name is required';
  } else if (trimmedName.length < 2 || trimmedName.length > 50) {
    errors.name = 'Name must be 2–50 characters';
  }

  const trimmedEmail = (email || '').trim();
  if (!trimmedEmail) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8 || password.length > 72) {
    errors.password = 'Password must be 8–72 characters';
  } else if (!/[a-zA-Z]/.test(password)) {
    errors.password = 'Password must contain at least one letter';
  } else if (!/[0-9]/.test(password)) {
    errors.password = 'Password must contain at least one number';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};

  const trimmedEmail = (email || '').trim();
  if (!trimmedEmail) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return errors;
}

export function validateTodo({ title, description }) {
  const errors = {};

  const trimmedTitle = (title || '').trim();
  if (!trimmedTitle) {
    errors.title = 'Title is required';
  } else if (trimmedTitle.length > 100) {
    errors.title = 'Title must be at most 100 characters';
  }

  if (description && description.trim().length > 500) {
    errors.description = 'Description must be at most 500 characters';
  }

  return errors;
}

