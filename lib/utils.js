var semver = require('semver');
var createError = require('./createError');
var string = require('mout/string');

var NEXUS_PREFIX = "nexus://";

function clean(version) {
    var parsed = semver.parse(version);

    if (!parsed) {
        return null;
    }

    // Keep builds!
    return parsed.version + (parsed.build.length ? '+' + parsed.build.join('.') : '');
}

function extractReleases(response) {
    
    try {
        var json = JSON.parse(response);
    } catch (e){
        throw createError('Malformed JSON', 'EBADJSON', {
            details: 'The JSON requested to extract package release is corrupted'
        });
    }
    
    var res = Object.keys(json.versions).map(function (tag) {
        return {
            release: clean(tag) || tag,
            target: tag,
            version: clean(tag)
        };
    });
    
    return res;
}

function getAuthToken(config) {	
	if (!config.auth) {
		throw createError('Authentication token not configured', 'ENOAUTHTOKEN', {
			details: 'You need to set the authentication token with `auth` field in .bowerrc'
		});
	} else {
		return config.auth;
	}
	return 
}

function getRegistryUrl(config) {
    var registryUrl = config.registry.register;

    if (registryUrl.indexOf('nexus') > -1) {
        return config.registry.register;
    }

    var found = config.registry.search.some(function (searchRegistry) {
        if (searchRegistry.indexOf('nexus') > -1) {
            registryUrl = searchRegistry;
            return true;
        }
    });

    if (found) {
      return registryUrl;
    }

    throw createError('Nexus registry not configured', 'ENOCONFIG', {
        details: 'You need to set Nexus registry in config.registry.register or config.registry.search of .bowerrc'
    });
};

function getRepositoryName(source) {
    var match = source.replace(NEXUS_PREFIX, "").split("/");

    if (match.length < 2) {
        throw createError('Invalid Nexus Package Name', 'EINVEND', {
            details: source + ' does not seem to be a valid Nexus package name: nexus://<package-name>/<version>'
        });
    }

    return match[0] + "/" + match[1];
};

function getNexusRegistry(config) {
    if (!config.nexusRegistry) {
        throw createError('No Nexus registry is defined', 'ENONEXUSREG', {
            details: 'You need to set nexusRegistry in .bowerrc'
        });
    }
    return config.nexusRegistry;
};

exports.clean = clean;
exports.extractReleases = extractReleases;
exports.getRegistryUrl = getRegistryUrl;
exports.getRepositoryName = getRepositoryName;
exports.NEXUS_PREFIX = NEXUS_PREFIX;
exports.getNexusRegistry = getNexusRegistry;
exports.getAuthToken = getAuthToken;
