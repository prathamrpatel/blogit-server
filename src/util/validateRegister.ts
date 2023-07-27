import { FieldError } from '../graphql/FieldError';

export const validateRegister = (
  username: string,
  password: string
): FieldError[] | null => {
  if (username.length <= 0) {
    return [
      {
        field: 'username',
        message: 'Please enter a username',
      },
    ];
  }

  if (password.length < 5) {
    return [
      {
        field: 'password',
        message: 'Password must be at least 5 characters long',
      },
    ];
  }

  return null;
};
