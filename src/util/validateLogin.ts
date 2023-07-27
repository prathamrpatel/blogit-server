import { FieldError } from '../graphql/FieldError';

export const validateLogin = (
  username: string,
  password: string
): FieldError[] | null => {
  if (username.length === 0) {
    return [
      {
        field: 'username',
        message: 'Please enter a username',
      },
    ];
  }

  if (password.length === 0) {
    return [
      {
        field: 'password',
        message: 'Please enter a password',
      },
    ];
  }

  return null;
};
