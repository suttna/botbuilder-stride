import { IEvent, Message } from "botbuilder"
import { StrideEventType } from "../interfaces"
import { Address } from "../lib/address"
import { BaseInteractor, IInteractorResult } from "./base_interactor"

export class EventInteractor extends BaseInteractor {

  public async call(): Promise<IInteractorResult> {
    const events: IEvent[] = []

    if (this.envelope.type === StrideEventType.ChatMessageSent) {
      events.push(this.buildMessageEvent())
    }

    return { events }
  }

  private buildMessageEvent(): IEvent {
    const conversation = this.envelope.conversation
    const address = new Address()
      .user(this.envelope.sender.id)
      .bot(this.settings.botId, this.settings.botName)
      .channel(conversation.id, conversation.name, conversation.type)
      .id(this.envelope.message.id)

    return new Message()
      .address(address.toAddress())
      .timestamp(this.envelope.message.ts)
      .sourceEvent(this.buildMessageSourceEvent())
      .text(this.envelope.message.text)
      .toMessage()
  }

  private buildMessageSourceEvent() {
    return (
      {
        stride: {
          StrideMessage: {
            ...this.envelope,
          },
        },
      }
    )
  }
}
