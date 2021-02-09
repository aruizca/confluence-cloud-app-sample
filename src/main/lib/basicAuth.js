
const request = require('request');
const encrypt = require('./node-jsencrypt');
const { renameProps, methodMapping, defaultOptions } = require('../util')

module.exports = (baseUrl, username, password, additionalOptions = {}) => {
  const client = (options = {}) => {
    let _options = { ...defaultOptions, ...options, ...additionalOptions };
    return new Promise(async (resolve, reject) => {
      const type = (_options.type && methodMapping[_options.type.toLowerCase()]) || 'get';
      const authHeader = {
        Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
      }
      _options.url = baseUrl + _options.url;
      _options.headers = {
        ..._options.headers, ...authHeader
      };

      renameProps(_options, {
        url: 'uri',
        data: 'body',
        type: 'method'
      });

      request(_options, (err, resp, body) => {
        resp = resp ? resp : { statusCode: 500 };
        if (!err && resp.statusCode < 300) {
          if (body === '') {
            resolve({ status: 'ok' });
          } else {
            try {
              // only when request expects binary, this option will be explicitly null
              if (_options.encoding === null) {
                resolve(body)
              } else {
                const jsonBody = JSON.parse(body);
                resolve(jsonBody);
              }
            } catch (err) {
              reject({ status: 500, message: 'Could not parse response' });
            }
          }
        } else if (!err && type === 'get' && resp.statusCode === 404) {
          // Valid case at GET: It does not exist -> resolve empty
          resolve();
        } else {
          try {
            const jsonBody = JSON.parse(body);
            renameProps(jsonBody, { statusCode: 'status' });
            reject(jsonBody);
          } catch (err) {
            reject({ status: 500, message: body });
          }
        }
      });
    });
  };
  client.encrypt = encrypt;
  return client;
};