import { IAddress, IConnector, IEvent, IMessage } from "botbuilder"

export class StrideConnector implements IConnector {
  public onEvent(handler: (events: IEvent[], cb?: (err: Error) => void) => void) {
    // no-op
  }

  public onInvoke(handler: (event: IEvent, cb?: (err: Error, body: any, status?: number) => void) => void) {
    // no-op
  }

  public onDispatch(handler: (events: IEvent[], cb?: (events: IEvent[]) => void) => void) {
    // no-op
  }

  public send(messages: IMessage[], cb: (err: Error, addresses?: IAddress[]) => void) {
    // no-op
  }

  public startConversation(address: IAddress, cb: (err: Error, address?: IAddress) => void) {
    // no-op
  }

  public update(message: IMessage, done: (err: Error, address?: IAddress) => void) {
    // no-op
  }

  public delete(address: IAddress, done: (err: Error) => void) {
    // no-op
  }
}
