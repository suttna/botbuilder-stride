import { StrideConversationType } from "../interfaces"
import { IStrideAddress } from "../stride_connector"

export class Address {
  private data = {} as IStrideAddress

  constructor() {
    this.data.channelId = "stride"
  }

  public id(id: string) {
    this.data.id = id

    return this
  }

  public channel(id: string, name: string, type: StrideConversationType) {
    const isGroup = type === StrideConversationType.Group

    this.data.conversation = { id, name, isGroup }

    return this
  }

  public user(user: string, name?: string) {
    this.data.user = { id: user }

    return this
  }

  public bot(id: string, name: string) {
    this.data.bot = { id, name }

    return this
  }

  public toAddress() {
    if (!this.data.bot || !this.data.user || !this.data.conversation) {
      throw new Error("Invalid address")
    }

    return this.data
  }
}
