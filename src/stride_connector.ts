import { IAddress, IConnector, IEvent, IMessage } from "botbuilder"
import { EventInteractor } from "./interactors"
import { IStrideMessage, StrideBodyType, StrideContentType, WebClient } from "./lib/web_client"

export interface IStrideAddress extends IAddress {
  id?: string
}

export interface IStrideCredentials {
  cloudId: string
  clientId: string
  clientSecret: string
}

export interface IStrideConnectorCache {
  getCloudIdByBot: (botId: string) => Promise<string>
}

export interface IStrideConnectorSettings {
  botId: string
  botName: string
  clientId: string
  clientSecret: string
  cache: IStrideConnectorCache
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
    Promise.all(messages.map(async (message) => {
      const address = message.address

      // This is used to clear cache data, we don't need to do anything with this kind of message
      if (message.type === "endOfConversation") {
        return address
      }

      if ((!message.text || message.text === "" || message.text === {}) && !message.attachments) {
        throw new Error("Messages without content are not allowed.")
      } else {
        const text     = this.transformTextToStrideFormat(message.text)
        const client   = await this.createClient(address.bot.id)
        const response = await client.postMessage(address.conversation.id, text)

        return { ...address, id: response.id }
      }
    }))
    .then((x) => cb(null, x))
    .catch((err) => cb(err, null))
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

  private dispatchEvents(events: IEvent[]): void {
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

  private transformTextToStrideFormat(text: string|IStrideMessage): IStrideMessage {
    if (typeof text === "string") {
      return {
        version: 1,
        type: StrideBodyType.Doc,
        content: [{ type: StrideContentType.Paragraph, content: [{ type: StrideContentType.Text, text }]}],
      } as IStrideMessage
    } else {
      return text as IStrideMessage
    }
  }

  private async createClient(botId: string): Promise<WebClient> {
    const cloudId = await this.settings.cache.getCloudIdByBot(botId)
    const credentials = {
      cloudId,
      clientId: this.settings.clientId,
      clientSecret: this.settings.clientSecret,
    } as IStrideCredentials

    return new WebClient(credentials)
  }
}
