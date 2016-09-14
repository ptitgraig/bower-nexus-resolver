var request = require('request');
var Q = require('q');
var url = require('url');
var utils = require('./utils');
var object = require('mout/object');
var createError = require('./createError');

function requestWrapper(requestUrl, config) {
    var deferred = Q.defer();

    var protocol = url.parse(requestUrl).protocol;
	
	var auth = utils.getAuthToken(config);
	
    var _request = request.defaults({
        proxy: protocol === 'https:' ? config.httpsProxy : config.proxy,
        strictSSL: false,
        timeout: config.timeout
    });
    if(auth !== null){
        _request = _request.defaults({headers : {
            "Authorization" : auth
        }});
    }

    _request = _request.defaults(config.request || {})

    _request(requestUrl, function (error, response, body) {
        if (error) {
            deferred.reject(createError('Request to ' + requestUrl + ' failed: ' + error.message, error.code));
        } else {
            if (response.statusCode === 200) {
                deferred.resolve(body);
            } else {
                deferred.reject(createError('Request to ' + requestUrl + ' returned ' + response.statusCode + ' status code.', 'EREQUEST', {
                    details: response.toString()
                }));
            }
        }
    });

    return deferred.promise;
};

module.exports = requestWrapper;
