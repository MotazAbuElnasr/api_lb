class CustomError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    Object.assign(this, { statusCode, code, details });
  }
}

module.exports = CustomError;
