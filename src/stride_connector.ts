import { IAddress, IConnector, IEvent, IMessage } from "botbuilder"
import { EventInteractor } from "./interactors"

export interface IStrideAddress extends IAddress {
  id?: string
}

export interface IStrideConnectorSettings {
  botId: string
  botName: string
  clientId: string
  clientSecret: string
}

export class StrideConnector implements IConnector {
  private onEventHandler: (events: IEvent[], cb?: (err: Error) => void) => void
  // @ts-ignore
  private onInvokeHandler: (event: IEvent, cb?: (err: Error, body: any, status?: number) => void) => void
  private onDispatchEvents: (events: IEvent[], cb?: (events: IEvent[]) => void) => void

  constructor(protected settings: IStrideConnectorSettings) { }

  public listenEvents() {
    return (req: any, res: any, next: () => void) => {
      new EventInteractor(this.settings, req.body)
        .call()
        .then((result) => {
          this.dispatchEvents(result.events)

          res.status(200)
          res.end()
          next()
        })
        .catch((error) => {
          res.status(500)
          res.end()
          next()
        })
    }
  }

  public onEvent(handler: (events: IEvent[], cb?: (err: Error) => void) => void) {
    this.onEventHandler = handler
  }

  public onInvoke(handler: (event: IEvent, cb?: (err: Error, body: any, status?: number) => void) => void) {
    this.onInvokeHandler = handler
  }

  public onDispatch(handler: (events: IEvent[], cb?: (events: IEvent[]) => void) => void) {
    this.onDispatchEvents = handler
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

  private dispatchEvents(events: IEvent[]) {
    if (events.length > 0) {
      if (this.onDispatchEvents) {
        this.onDispatchEvents(events, (transformedEvents) => {
          this.onEventHandler(transformedEvents)
        })
      } else {
        this.onEventHandler(events)
      }
    }
  }
}
