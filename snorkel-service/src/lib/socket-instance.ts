import { Socket } from "socket.io";
import instagramHandling from "../instagram/controller/handling";

export default (socket: Socket) => {
  instagramHandling(socket);
}
