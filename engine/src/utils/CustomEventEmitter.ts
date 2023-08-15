import EventEmitter from "events";
import TypedEventEmitter, { EventMap } from "typed-emitter";

export class MyEventEmitter<T extends EventMap> extends (EventEmitter as { new <T extends EventMap>(): TypedEventEmitter<T> })<T> {
  constructor() {
    super()
  }
}
