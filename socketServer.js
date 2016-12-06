import config from './config/env';
import app from './config/express';
import apiSocket from './socketServer/apiSocket';

const debug = require('debug')('rodin-ja-api:index');

// listen on port config.port
const server = app.listen(config.socketPort, () => {
  debug(`server started on port ${config.socketPort} (${config.env})`);
});

apiSocket.run(server);

export default app;
