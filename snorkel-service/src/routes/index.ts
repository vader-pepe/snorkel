import status from "../health/routes"
import instagram from "../instagram/routes"
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
  app.use('/instagram', instagram);
  // app.use('/users', users);

  app.use('*', (_req, res) => {
    res.send('Not found!!!');
  });
}

