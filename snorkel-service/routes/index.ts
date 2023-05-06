// const status = require('../src/health/routes');
// const users = require('../src/users/routes');
// const validateAuth = require('../middlewares/validateAuth');
// const getData = require('../middlewares/getData');
import status from "../src/health/routes"
import { Express } from "express"

// module.exports = (app) => {
// app.use('/status', status);
// app.use('/users', users);
// app.use('/users', validateAuth.checkIfAuthenticated, getData.getGeoip, users);
// app.use('*', (req, res) => {
// res.send('Not found!!!');
// });
// };
export default function routes(app: Express): void {
  app.use('/status', status);
  // app.use('/users', users);

  app.use('*', (_req, res) => {
    res.send('Not found!!!');
  });
}

