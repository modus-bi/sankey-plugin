const config = require('../config');
const server = require('../server/main');
const debug = require('debug')('app:bin:server');


server.listen(config.server_port);
debug(`Server is now running at http://localhost:${config.server_port}.`);

