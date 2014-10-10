var fs = Npm.require('fs');
var path = Npm.require('path');

Package.describe({
  name: 'meteorhacks:zones',
  summary: 'Zone.Js integration for meteor',
  version: "1.3.2",
  git: "https://github.com/meteorhacks/zones.git"
});

Npm.depends({
  'connect': '2.26.1'
});

Package.on_use(function (api) {
  addPackageFiles(api);
  api.export('Zones', 'server');
});

Package.on_test(function (api) {
  addPackageFiles(api);

  api.use([
    'tinytest',
    'test-helpers',
  ], 'client');

  api.add_files([
    'tests/_both.js'
  ], ['client', 'server']);

  api.add_files([
    'tests/_server.js'
  ], 'server');

  api.add_files([
    'tests/loader.js',
    'tests/reporters.js',
    'tests/hijacks/methods.js',
    'tests/hijacks/subscriptions.js',
    'tests/hijacks/collections.js',
  ], 'client');
});

function addPackageFiles(api) {
  // Add iron router only if it exists
  if(api.versionsFrom) {
    api.versionsFrom('METEOR@0.9.2.1');
    api.use('meteorhacks:inject-initial@1.0.0', ['server']);
    api.use(['iron:router@0.9.0'], ['client', 'server'], {weak: true});
  } else {
    api.use('inject-initial');
    if(ironRouterExists()) {
      // weak dependencies are not supported for packages before Meteor 0.9
      // need to check whether iron-router exists and use it only if it does
      api.use(['iron-router'], ['client', 'server']);
    }
  }

  api.add_files([
    'assets/zone.js',
    'assets/utils.js',
    'assets/tracer.js',
    'assets/reporters.js',
    'assets/init.js',
  ], 'server', {isAsset: true});

  api.add_files(['server/inject.js'], 'server');
  api.add_files(['client/hijack.js'], 'client');

  api.use('underscore', 'client');
  api.use('ui', 'client');
  api.use('templating', 'client');
  api.use('deps', 'client');
  api.use('session', 'client');
  api.use('livedata', 'client');
  api.use('minimongo', 'client');
  api.use('webapp', 'server');
  api.use('minifiers', 'server');
}

//--------------------------------------------------------------------------\\

function ironRouterExists() {
  try {
    var meteorPackages = fs.readFileSync(path.join(meteorRoot(), '.meteor', 'packages'), 'utf8');
    return !!meteorPackages.match(/iron-router/);
  } catch(ex) {
    // seems like FastRender running outside a Meteor app (ie: with tinytest)
    // So there is no iron-router
    return false;
  }
}

function meteorRoot() {
  var currentDir = process.cwd();
  while (currentDir) {
    var newDir = path.dirname(currentDir);
    if (isAppDir(currentDir)) {
      break;
    } else if (newDir === currentDir) {
      return null;
    } else {
      currentDir = newDir;
    }
  }
  return currentDir;
}

function isAppDir(filepath) {
  try {
    return fs.statSync(path.join(filepath, '.meteor', 'packages')).isFile();
  } catch (e) {
    return false;
  }
}
