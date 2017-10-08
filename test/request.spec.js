const request = require('../src/request');
const should = require('should');
const nock = require('nock');
const keys = require('./keys');
const ramses = require('express-ramses-auth');

let userToken;
before(function (done) {
  ramses.sign({
    iss: '127.0.0.1/ticket',
    aud: ['127.0.0.1/service'],
    azp: 'user'
  }, keys.rsaPrivateKey, function (err, token) {
    userToken = token;
    done();
  })
})

let serviceToken;
before(function (done) {
  ramses.sign({
    iss: '127.0.0.1/ticket',
    aud: ['127.0.0.1/test'],
    azp: '127.0.0.1/service'
  }, keys.rsaPrivateKey, function (err, token) {
    serviceToken = token;
    done();
  })
})

describe.only('request', function () {
  beforeEach(function () {
    nock.cleanAll();
  });
  describe('basic functionality', function () {

    it('get with http should work', function () {
      let url = 'http://127.0.0.1';
      let mock = nock(url).get('').reply(200);

      return request.get(url)
        .then((res) => {
          res.status.should.eql(200)
        })
    });

    it('get with https should work', function () {
      let url = 'https://127.0.0.1';
      let mock = nock(url).get('').reply(200);

      return request.get(url)
        .then((res) => {
          res.status.should.eql(200)
        })
    });

    it('get without http or https should work', function () {
      let url = '127.0.0.1';
      let mock = nock('http://' + url).get('').reply(200);

      return request.get(url)
        .then((res) => {
          res.status.should.eql(200)
        })
    });

    it('get with port should work', function () {
      let url = 'https://127.0.0.1:2000';
      let mock = nock(url).get('').reply(200);

      return request.get(url)
        .then((res) => {
          res.status.should.eql(200)
        })
    });

    it('get with path should work', function () {
      let url = 'https://127.0.0.1';
      let mock = nock(url).get('/test').reply(200);

      return request.get(url + '/test')
        .then((res) => {
          res.status.should.eql(200)
        })
    });

    it('get with query string should work', function () {
      let url = 'https://127.0.0.1';
      let mock = nock(url).get('').query({
        test: 'value'
      }).reply(200);

      return request.get(url + '?test=value')
        .then((res) => {
          res.status.should.eql(200)
        })
    });

    it('get with path and query string should work', function () {
      let url = 'https://127.0.0.1';
      let mock = nock(url).get('/test').query({
        test: 'value'
      }).reply(200);

      return request.get(url + '/test?test=value')
        .then((res) => {
          res.status.should.eql(200)
        })
    });

    it('get with stacked path should work', function () {
      let url = 'https://127.0.0.1/test/path/is/deep';
      let mock = nock(url).get('').reply(200);

      return request.get(url)
        .then((res) => {
          res.status.should.eql(200)
        })
    });

    it('get with bad request should fail', function () {
      let url = 'https://127.0.0.1';
      let mock = nock(url).get('').reply(400, 'Bad request message.');

      return request.get(url)
        .catch((err) => {
          err.status.should.eql(400);
          err.data.body.should.eql('Bad request message.');
          err.code.should.eql('request_failed');
        })
    });

    it('post should work', function () {
      let url = 'https://127.0.0.1';
      let mock = nock(url).post('', {
        key: 'value'
      }).reply(200, 'Success');

      return request.post(url, {
          key: 'value'
        })
        .then((res) => {
          res.status.should.eql(200);
          res.body.should.eql('Success')
        })
    });

    it('put should work', function () {
      let url = 'https://127.0.0.1';
      let mock = nock(url).put('', {
        key: 'value'
      }).reply(200, 'Success');

      return request.put(url, {
          key: 'value'
        })
        .then((res) => {
          res.status.should.eql(200);
          res.body.should.eql('Success')
        })
    });

    it('patch should work', function () {
      let url = 'https://127.0.0.1';
      let mock = nock(url).patch('', {
        key: 'value'
      }).reply(200, 'Success');

      return request.patch(url, {
          key: 'value'
        })
        .then((res) => {
          res.status.should.eql(200);
          res.body.should.eql('Success')
        })
    });

    it('delete should work', function () {
      let url = 'https://127.0.0.1';
      let mock = nock(url).delete('').reply(200, 'Success');

      return request.delete(url)
        .then((res) => {
          res.status.should.eql(200);
          res.body.should.eql('Success')
        })
    });

    it('head should work', function () {
      let url = 'https://127.0.0.1';
      let mock = nock(url).head('').reply(200);

      return request.head(url)
        .then((res) => {
          res.status.should.eql(200);
        })
    });

    it('options should work', function () {
      let url = 'https://127.0.0.1';
      let mock = nock(url).options('').reply(200);

      return request.options(url)
        .then((res) => {
          res.status.should.eql(200);
        })
    });


    it('headers should be set', function () {
      let url = 'https://127.0.0.1';
      let mock = nock(url, {
        reqheaders: {
          custom: 'header'
        }
      }).get('').reply(200);

      return request.get(url, {
          headers: {
            custom: 'header'
          }
        })
        .then((res) => {
          res.status.should.eql(200);
        })
    });

    it('queryString should get added to path', function () {
      let url = 'https://127.0.0.1';
      let mock = nock(url).get('').query({
        limit: 50,
        page: 2
      }).reply(200);

      return request.get(url, {
          queryStrings: {
            limit: 50,
            page: 2
          }
        })
        .then((res) => {
          res.status.should.eql(200);
        })
    });

    it('queryString should get appended to path', function () {
      let url = 'https://127.0.0.1';
      let mock = nock(url).get('').query({
        limit: 50,
        page: 2
      }).reply(200);

      return request.get(url + '?limit=50', {
          queryStrings: {
            page: 2
          }
        })
        .then((res) => {
          res.status.should.eql(200);
        })
    });

    it('to long delay should timeout', function () {
      let url = 'https://127.0.0.1';
      let mock = nock(url).get('').socketDelay(200).reply(500);

      return request.get(url, {
          timeout: 100
        })
        .catch((err) => {
          err.status.should.eql(500);
          err.code.should.eql('ECONNRESET');
        })
    });

    it('smaller delay should not timeout', function () {
      let url = 'https://127.0.0.1';
      let mock = nock(url).get('').socketDelay(100).reply(200);

      return request.get(url, {
          timeout: 200
        })
        .then((res) => {
          res.status.should.eql(200);
        })
    });

  });

  describe('ramses', function () {

    let url = 'https://127.0.0.1';
    let mock = nock(url).get('/test').reply(200)

    it('empty ramses options should fail', function () {
      return request.get(url, {
          ramses: {}
        })
        .catch((err) => {
          err.status.should.eql(500);
          err.code.should.eql('missing_ramses_options');
        })
    });

    it('missing ramses key should fail', function () {
      return request.get(url + '/test', {
          ramses: {
            ticketServiceURL: 'https://127.0.0.1/ticket'
          }
        })
        .catch((err) => {
          err.status.should.eql(500);
          err.code.should.eql('missing_ramses_options');
        })
    });

    it('missing ramses ticketServiceURL should fail', function () {
      return request.get(url + '/test', {
          ramses: {
            key: keys.rsaPrivateKey
          }
        })
        .catch((err) => {
          err.status.should.eql(500);
          err.code.should.eql('missing_ramses_options');
        })
    });

    it('missing ramses azp should fail', function () {
      return request.get(url + '/test', {
          ramses: {
            ticketServiceURL: 'https://127.0.0.1/ticket',
            key: keys.rsaPrivateKey
          }
        })
        .catch((err) => {
          err.status.should.eql(500);
          err.code.should.eql('missing_ramses_options');
        })
    });

    it('wrong authorization header should fail', function () {
      return request.get(url + '/test', {
          ramses: {
            ticketServiceURL: 'https://127.0.0.1/ticket',
            key: keys.rsaPrivateKey,
            authorizationHeader: 'wrong'
          }
        })
        .catch((err) => {
          err.status.should.eql(500);
          err.code.should.eql('ramses_decoding_error');
        })
    });

    it('not permitted ticket request should fail', function () {
      let mock2 = nock(url + '/ticket').post('/').reply(401)

      return request.get(url + '/service', {
          ramses: {
            ticketServiceURL: 'https://127.0.0.1/ticket/',
            key: keys.rsaPrivateKey,
            authorizationHeader: `Bearer ${userToken}`
          }
        })
        .catch((err) => {
          err.status.should.eql(500);
          err.code.should.eql('error_requesting_ticket');
        })
    });

    it('correct authorization header but failing request should fail', function () {
      let mock = nock(url + '/ticket').post('/').reply(200, serviceToken)
      let mock2 = nock(url, {
        reqheaders: {
          Authorization: `Bearer ${serviceToken}`
        }
      }).get('/service').reply(400)

      return request.get(url + '/service', {
          ramses: {
            ticketServiceURL: 'https://127.0.0.1/ticket/',
            key: keys.rsaPrivateKey,
            authorizationHeader: `Bearer ${userToken}`
          }
        })
        .catch((err) => {
          err.status.should.eql(500);
          err.code.should.eql('request_error');
        })
    });

    it('correct authorization header should verify', function () {
      let mock = nock(url + '/ticket').post('/').reply(200, serviceToken)
      let mock2 = nock(url, {
        reqheaders: {
          Authorization: `Bearer ${serviceToken}`
        }
      }).get('/service').reply(200)

      return request.get(url + '/service', {
          ramses: {
            ticketServiceURL: 'https://127.0.0.1/ticket/',
            key: keys.rsaPrivateKey,
            authorizationHeader: `Bearer ${userToken}`
          }
        })
        .then((response) => {
          response.status.should.eql(200);
        })
    });

    it('initial ticket request without permission should fail', function () {
      let mock = nock(url + '/ticket').post('/').reply(200, serviceToken)
      let mock2 = nock(url + '/ticket').post('/').reply(401)

      return request.get(url + '/test', {
          ramses: {
            ticketServiceURL: 'https://127.0.0.1/ticket',
            key: keys.rsaPrivateKey,
            azp: 'service'
          }
        })
        .catch((err) => {
          err.status.should.eql(500);
          err.code.should.eql('error_requesting_ticket');
        })
    });

    it('initial ticket request with failing request should fail', function () {
      let mock = nock(url + '/ticket').post('/').reply(200, serviceToken)
      let mock2 = nock(url, {
        reqheaders: {
          Authorization: `Bearer ${serviceToken}`
        }
      }).get('/service').reply(400)

      return request.get(url + '/service', {
          ramses: {
            ticketServiceURL: 'https://127.0.0.1/ticket/',
            key: keys.rsaPrivateKey,
            azp: 'service'
          }
        })
        .catch((err) => {
          err.status.should.eql(500);
          err.code.should.eql('request_error');
        })
    });

    it('initial ticket request should verify', function () {
      let mock = nock(url + '/ticket').post('/').reply(200, serviceToken)
      let mock2 = nock(url, {
        reqheaders: {
          Authorization: `Bearer ${serviceToken}`
        }
      }).get('/service').reply(200)

      return request.get(url + '/service', {
          ramses: {
            ticketServiceURL: 'https://127.0.0.1/ticket/',
            key: keys.rsaPrivateKey,
            azp: 'service'
          }
        })
        .then((response) => {
          response.status.should.eql(200);
        })
    });

  });

});
