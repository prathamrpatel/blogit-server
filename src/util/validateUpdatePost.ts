import { FieldError } from '../graphql/FieldError';

export const validatePost = (
  title: string,
  body: string
): FieldError[] | null => {
  if (title.length === 0) {
    return [
      {
        field: 'title',
        message: 'Enter a title',
      },
    ];
  }

  if (body.length === 0) {
    return [
      {
        field: 'body',
        message: 'Body cannot be left empty',
      },
    ];
  }

  return null;
};
