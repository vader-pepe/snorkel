import { Socket } from "socket.io";
import instagramHandler from "../instagram/controller/handling";
import twitterHandler from "../twitter/controller/handling";
import facebookHandler from "../facebook/controller/handling";

export default (socket: Socket) => {
  instagramHandler(socket);
  twitterHandler(socket);
  facebookHandler(socket);
}
