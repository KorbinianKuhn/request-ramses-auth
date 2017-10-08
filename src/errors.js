function RequestError(code, error, status, data) {
  this.name = "RequestError";
  this.message = error.message;
  Error.call(this, error.message);
  Error.captureStackTrace(this, this.constructor);
  this.code = code;
  this.status = status;
  this.inner = error;
  if (data) {
    this.data = data;
  }
}
RequestError.prototype = Object.create(Error.prototype);
RequestError.prototype.constructor = RequestError;
exports.RequestError = RequestError;
