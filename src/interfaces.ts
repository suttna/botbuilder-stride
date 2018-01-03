export enum StrideEventType {
  ChatMessageSent = "chat_message_sent",
}

export enum StrideConversationPrivacy {
  Private = "private",
  Public = "public",
}

export enum StrideConversationType {
  Direct = "direct",
  Group = "group",
}

export interface IStrideSender {
  id: string
}

export interface IStrideMessageBody {
  version: number
  type: string
  content: any[]
}

export interface IStrideMessage {
  id: string
  body: IStrideMessageBody
  text: string
  sender: IStrideSender
  ts: string
}

export interface IStrideConversation {
  avatarUrl: string
  id: string
  isArchived: boolean
  name: string
  privacy: StrideConversationPrivacy
  topic: string
  type: StrideConversationType
  modified: string
  created: string
}

export interface IStrideEventEnvelope {
  cloudId: string
  message: IStrideMessage
  recipients: string[]
  sender: IStrideSender
  conversation: IStrideConversation
  type: StrideEventType
}
