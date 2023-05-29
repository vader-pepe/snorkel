import status from "@/health/routes"
import instagram from "@/instagram/routes"
import facebook from "@/facebook/routes"
import twitter from "@/twitter/routes"
import fileUpload from "@/fileHandler/routes"
import { Express } from "express"

export default function routes(app: Express): void {
  app.use('/status', status);
  app.use('/instagram', instagram);
  app.use('/twitter', twitter);
  app.use('/facebook', facebook);
  app.use('/upload', fileUpload);

  app.use('*', (_req, res) => {
    res.send('Not found!!!');
  });
}

