var tmp = require('tmp');
tmp.setGracefulCleanup();

var request = require('./request');
var download = require('./download');
var extract = require('./extract');
var utils = require('./utils');

/**
 * Factory function for resolver
 * It is called only one time by Bower, to instantiate resolver.
 * You can instantiate here any caches or create helper functions.
 */
module.exports = function resolver (bower) {

  function getFragments(source) {
      return {
          registryUrl: utils.getRegistryUrl(bower.config),
          repositoryName: utils.getRepositoryName(source)
      }
  };

  // Resolver factory returns an instance of resolver
  return {

    // Match method tells whether resolver supports given source
    // It can return either boolean or promise of boolean
    // source = angular-ui-router (bower install angular-ui-router)
    match: function (source) {
      return source.indexOf(utils.NEXUS_PREFIX) === 0;
    },

    releases: function (source) {
      var fragments = getFragments(source);
      var requestUrl = utils.getNexusRegistry(bower.config) + fragments.repositoryName.split('/')[1];
      return request(requestUrl, bower.config).then(function (response) {
          return utils.extractReleases(response);
      });
    },

    // It downloads package and extracts it to temporary directory
    // You can use npm's "tmp" package to tmp directories
    // See the "Resolver API" section for details on this method
    // endpoint is the value returned by releases()
    fetch: function (endpoint, cached) {
      // If cached package is semver, reuse it
      if (cached.version) return;

      var fragments = getFragments(endpoint.source);
      var pkgFragment = fragments.repositoryName.split('/').join('/-/');
      var downloadUrl = utils.getNexusRegistry(bower.config) + pkgFragment + '-' + endpoint.target + '.tgz';
      var downloadPath = tmp.dirSync();

      return download(downloadUrl, downloadPath.name, bower.config).then(function (archivePatch) {
          var extractPath = tmp.dirSync();

          return extract(archivePatch, extractPath.name).then(function () {
              downloadPath.removeCallback();

              return {
                  tempPath: extractPath.name,
                  removeIgnores: true
              };
          });
      });
    }
  }
}