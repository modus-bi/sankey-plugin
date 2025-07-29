const path = require('path');
const debug = require('debug')('app:config');
const argv = require('yargs').argv;
const os = require('os');

const getIp = () => {
  const ifaces = os.networkInterfaces();
  let ip = '127.0.0.1';

  Object.keys(ifaces).forEach(function(ifname) {
    ifaces[ifname].forEach(function(iface) {
      if (iface.family !== 'IPv4' || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }
      ip = iface.address;
    });
  });
  return 'localhost';//ip;
};

debug('Creating default configuration.');
// ========================================================
// Default Configuration
// ========================================================
const config = {
  env : process.env.NODE_ENV || 'development',

  // ----------------------------------
  // Project Structure
  // ----------------------------------
  path_base  : path.resolve(__dirname, '..'),
  dir_client : 'src',
  dir_dist   : 'dist',
  dir_prebuild   : 'prebuild',
  dir_server : 'server',
  dir_test   : 'tests',

  // ----------------------------------
  // Server Configuration
  // ----------------------------------
  server_host : getIp(), // use string 'localhost' to prevent exposure on local network
  server_port : process.env.PORT || 7000,
  server_port_SSL : 3001,


  // ----------------------------------
  // Compiler Configuration
  // ----------------------------------
  compiler_babel : {
    cacheDirectory : false,
    plugins        : [
      'lodash',
      'dynamic-import-webpack',
      '@babel/plugin-transform-runtime',
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-transform-react-jsx',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-transform-nullish-coalescing-operator',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-transform-modules-commonjs',
    ],
    presets        : [
      '@babel/preset-env',
      '@babel/preset-react',
    ]
  },
  compiler_devtool: 'cheap-module-source-map', //(process.env.NODE_ENV === 'production') ? 'source-map' : 'cheap-module-source-map',
  compiler_hash_type       : 'hash',
  compiler_fail_on_warning : false,
  compiler_quiet           : false,
  compiler_public_path     : '/',
  compiler_stats           : {
    chunks : false,
    chunkModules : false,
    colors : true
  },
  compiler_vendors: [
    'core-js',
    'd3',
    'd3-color',
    'd3-format',
    'd3-geo',
    'd3-interpolate',
    'd3-scale',
    'd3-scale-chromatic',
    'd3-selection',
    'd3-shape',
    'd3-transition',
    'leaflet',
    'moment',
    'react-dnd',
    'react-color',
    'react-redux',
    'react-router',
    'react-leaflet',
    'react-rte',
    'redux',
    'redux-thunk',
    'redux-actions',
    'redux-batch-enhancer',
    'redux-batched-actions',
    'gojs',
    'gojs-react',
  ],

  // ----------------------------------
  // Editor Configuration
  // ----------------------------------
  coverage_reporters : [
    { type : 'text-summary' },
    { type : 'lcov', dir : 'coverage' }
  ]
};

/************************************************
-------------------------------------------------

All Internal Configuration Below
Edit at Your Own Risk

-------------------------------------------------
************************************************/

// ------------------------------------
// Environment
// ------------------------------------
// N.B.: globals added here must _also_ be added to .eslintrc
config.globals = {
  'process.env'  : {
    'NODE_ENV' : JSON.stringify(config.env)
  },
  'NODE_ENV'     : config.env,
  '__DEV__'      : config.env === 'development',
  '__PROD__'     : config.env === 'production',
  '__TEST__'     : config.env === 'test',
  '__COVERAGE__' : !argv.watch && config.env === 'test',
  '__BASENAME__' : JSON.stringify(process.env.BASENAME || ''),
  '__LOGGER__'   : process.env.LOGGER
};


// ------------------------------------
// Validate Vendor Dependencies
// ------------------------------------
const pkg = require('../package.json');

config.compiler_vendors = config.compiler_vendors
  .filter((dep) => {
    if (pkg.dependencies[dep]) {
      return true;
    }
    debug(
      `Package "${dep}" was not found as an npm dependency in package.json; ` +
      `it won't be included in the webpack vendor bundle.
       Consider removing it from \`compiler_vendors\` in ~/config/index.js`
    );
    return false;
  });
// ------------------------------------
// Utilities
// ------------------------------------
function base() {
  const args = [config.path_base].concat([].slice.call(arguments));
  return path.resolve.apply(path, args);
}

config.utils_paths = {
  base,
  client: base.bind(null, config.dir_client),
  prebuild: base.bind(null, config.dir_prebuild),
};

// ========================================================
// Environment Configuration
// ========================================================
debug(`Looking for environment overrides for NODE_ENV "${config.env}".`);
const environments = require('./environments');
const overrides = environments[config.env];
if (overrides) {
  debug('Found overrides, applying to default configuration.');
  Object.assign(config, overrides(config));
}
else {
  debug('No environment overrides found, defaults will be used.');
}

module.exports = config;
