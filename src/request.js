const http = require('http');
const https = require('https');
const RequestError = require('./errors').RequestError;
const ramses = require('express-ramses-auth');

const request = function (url, options) {
  let lib, hostname, port, path, parts;

  //Strip leading http or https and define lib
  if (url.startsWith('https://')) {
    lib = https;
    parts = url.split('https://')[1];
  } else if (url.startsWith('http://')) {
    lib = http;
    parts = url.split('http://')[1];
  } else {
    lib = http;
    parts = url;
  }

  //Get the hostname
  hostname = parts.split('/')[0].split('?')[0];

  //Get path
  path = parts.replace(hostname, '');

  //Strip port from hostname if found
  if (hostname.indexOf(':') !== -1) {
    options.port = hostname.split(':')[1];
    hostname = hostname.split(':')[0];
  }

  //Set default port if not set yet
  if (!options.port) {
    if (lib === https) {
      options.port = 443;
    } else {
      options.port = 80;
    }
  }

  //Add query params to path
  if (options.queryStrings) {
    let queryString = '';
    if (path.indexOf('?') === -1) {
      queryString += '?';
    } else {
      queryString += '&';
    }
    for (let key in options.queryStrings) {
      queryString += `${key}=${options.queryStrings[key]}&`;
    }
    path += queryString.slice(0, -1);
  }

  //Create request options object
  let requestOptions = {
    hostname: hostname,
    port: options.port,
    path: path,
    method: options.method,
    headers: options.headers || {},
  };

  //Add body if method sends data
  let dataRequestReady;
  if (options.body) {
    dataRequestReady = JSON.stringify(options.body);
    requestOptions.headers['Content-Type'] = 'application/json; charset=utf-8';
    requestOptions.headers['Content-Length'] = dataRequestReady.length;
  }

  //Set options headers to empty object if not set
  options.headers = options.headers || {};

  return new Promise((resolve, reject) => {
    if (options.ramses) {
      if (!options.ramses.key || !options.ramses.ticketServiceURL || (!options.ramses.authorizationHeader && !
          options.ramses.azp)) {
        return reject(new RequestError('missing_ramses_options', new Error('Missing ramses options'), 500));
      }
      if (options.ramses.authorizationHeader) {
        const dtoken = ramses.decode(options.ramses.authorizationHeader.split(' ')[1]);
        if (dtoken === null) {
          return reject(new RequestError('ramses_decoding_error', new Error('Error decoding authorization header'),
            500));
        } else {
          ramses.createProof(dtoken.payload.jti, options.ramses.key, function (err, proof) {
            if (err) {
              return reject(new RequestError('error_creating_proof', err, 500));
            } else {
              postRequest(options.ramses.ticketServiceURL, {
                  proof: proof,
                  url: url
                }, {
                  headers: {
                    'Authorization': options.ramses.authorizationHeader
                  }
                })
                .then((response) => {
                  delete options.ramses;
                  options.headers['Authorization'] = `Bearer ${response.body}`;
                  request(url, options)
                    .then((response) => {
                      return resolve(response);
                    })
                    .catch((err) => {
                      return reject(new RequestError('request_error', err, 500));
                    })
                })
                .catch((err) => {
                  return reject(new RequestError('error_requesting_ticket', err, 500));
                })
            }
          });
        }
      } else {
        let timestamp = new Date().getTime();
        ramses.createProof(timestamp, options.ramses.key, function (err, proof) {
          if (err) {
            return reject(new RequestError('error_creating_proof', err, 500));
          } else {
            postRequest(options.ramses.ticketServiceURL, {
                proof: proof,
                timestamp: timestamp,
                url: url,
                azp: options.ramses.azp
              })
              .then((response) => {
                delete options.ramses;
                options.headers['Authorization'] = `Bearer ${response.body}`;
                request(url, options)
                  .then((response) => {
                    return resolve(response);
                  })
                  .catch((err) => {
                    return reject(new RequestError('request_error', err, 500));
                  })
              })
              .catch((err) => {
                return reject(new RequestError('error_requesting_ticket', err, 500));
              })
          }
        });
      }
    } else {

      const request = lib.request(requestOptions, (response) => {
        let body = [];
        response.on('data', (chunk) => {
          body.push(chunk)
        });
        response.on('end', () => {
          body = body.join('');

          if (response.statusCode < 200 || response.statusCode > 299) {
            return reject(
              new RequestError('request_failed', new Error('Request failed'), response.statusCode, {
                body: body
              }));
          } else {
            return resolve({
              status: response.statusCode,
              body: body
            })
          }
        });
      });

      //Add timeout if set in options
      if (options.timeout) {
        request.on('socket', function (socket) {
          socket.setTimeout(options.timeout);
          socket.on('timeout', function () {
            request.abort();
          });
        });
      }

      request.on('error', (err) => {
        return reject(new RequestError(err.code, err, 500));
      })

      //Send body data if necessary
      if (options.body) {
        request.write(dataRequestReady);
      }

      request.end();
    }
  });

}

const getRequest = function (url, options = {}) {
  options.method = 'GET';
  return request(url, options);
}
exports.get = getRequest;

const postRequest = function (url, body, options = {}) {
  options.method = 'POST';
  options.body = body;
  return request(url, options);
}
exports.post = postRequest;

const putRequest = function (url, body, options = {}) {
  options.method = 'PUT';
  options.body = body;
  return request(url, options);
}
exports.put = putRequest;

const patchRequest = function (url, body, options = {}) {
  options.method = 'PATCH';
  options.body = body;
  return request(url, options);
}
exports.patch = patchRequest;

const deleteRequest = function (url, options = {}) {
  options.method = 'DELETE';
  return request(url, options);
}
exports.delete = deleteRequest;

const optionsRequest = function (url, options = {}) {
  options.method = 'OPTIONS';
  return request(url, options);
}
exports.options = optionsRequest;

const headRequest = function (url, options = {}) {
  options.method = 'HEAD';
  return request(url, options);
}
exports.head = headRequest;
