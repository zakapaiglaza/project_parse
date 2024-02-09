export class XPathException extends Error {
  static INVALID_EXPRESSION_ERR = 51;
  static TYPE_ERR = 52;

  static fromMessage(message: string, error?: Error) {
    return new XPathException(undefined, error, message);
  }

  code?: number;
  exception?: Error;

  constructor(code?: number, error?: Error, message?: string) {
    super(getMessage(code, error) || message);

    this.code = code;
    this.exception = error;
  }

  toString() {
    return this.message;
  }
}

function getMessage(code?: number, exception?: Error) {
  const msg = exception ? ': ' + exception.toString() : '';
  switch (code) {
    case XPathException.INVALID_EXPRESSION_ERR:
      return 'Invalid expression' + msg;
    case XPathException.TYPE_ERR:
      return 'Type error' + msg;
  }
  return undefined;
}
