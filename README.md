# request-ramses-auth [![Travis](https://img.shields.io/travis/KorbinianKuhn/request-ramses-auth.svg)](https://travis-ci.org/KorbinianKuhn/request-ramses-auth/builds)  [![standard](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/)

#### Implementation of RAMSES - Robust Access Model for Securing Exposed Services

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Testing](#testing)
5. [Contribution](#contribution)
6. [License](#license)

## Introduction

RAMSES is an easily adoptable, customizable and
robust security model which will not consider any trusted
zones. It proposes an authentication and authorization pattern
for inter-service communication utilizing and extending JSON
Web Signatures (JWS) as tickets. RAMSES includes various
extensions for individual security levels and requirements, like
access capabilities, ticket invalidation, usage limitation and
payload encryption.

A detailed explanation of RAMSES will follow.

## Installation

For installation use the [Node Package Manager](https://github.com/npm/npm):

```
$ npm install --save request-ramses-auth
```

or clone the repository:

```
$ git clone https://github.com/KorbinianKuhn/request-ramses-auth
```

## Usage

### Simple usage

Just request your url and use the returned promise:

``` javascript
request.get('https://example.com/test')
.then((res) {
    console.log(res);
})
.catch((err) {
    console.log(err);
})
```

You can easily add queryParameters via the options:

```javascript
//Creates this string: https://example.com/test&limit=50&page=2
request.get('https://example.com/test', {
    query: {
        'limit':50,
        'page':2
    }
})
```

Set a timeout in milliseconds to limit the response time:

```javascript
request.get('https://example.com/test', {
    timeout: 2000
})
```

### With RAMSES options

To simplify the usage of RAMSES you just have to pass some options to the request function and it will request an access ticket before sending the initial request.

If you want to generate an access ticket from an access ticket:

```javascript
request.get('https://example.com/test', {
    ramses: {
        ticketServiceURL: 'https://127.0.0.1/ticket/',
        key: myPrivateKey,
        authorizationHeader: req.headers.authorization
    }
})
```

If a you need to generate an initial access ticket:

```javascript
request.get('https://example.com/test', {
    ramses: {
        ticketServiceURL: 'https://127.0.0.1/ticket/',
        key: myPrivateKey,
        azp: 'https://example.com/myurl'
    }
})
```

You can pass the same options to the other http request methods.

- `request.get(url [,options])`
- `request.delete(url [,options])`
- `request.head(url [,options])`
- `request.options(url [,options])`
- `request.post(url, body [,options])`
- `request.put(url, body [,options])`
- `request.patch(url, body [,options])`

## Testing

First you have to install all dependencies:

```
$ npm install
```

To execute all unit tests once, use:

```
$ npm test
```

To get information about the test coverage, use:

```
$ npm run coverage
```

## Contribution

Fork this repository and push in your ideas.

Do not forget to add corresponding tests to keep up 100% test coverage.

## License

The MIT License

Copyright (c) 2017 Korbinian Kuhn, Tobias Eberle, Christof Kost, Steffen Mauser, Marc Schelling

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.