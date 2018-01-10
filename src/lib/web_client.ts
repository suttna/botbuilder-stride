import * as rpn from "request-promise-native"
import { IStrideCredentials } from "../stride_connector"
import { AccessToken } from "./access_token"

enum HTTP {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Delete = "DELETE",
}

export enum StrideBodyType {
  Doc = "doc",
}

export enum StrideContentType {
  Paragraph = "paragraph",
  Text = "text",
}

export interface IStrideMessage {
  version: number
  type: StrideBodyType
  content: any[]
}

export class WebClient {

  private apiBaseUrl: string   = "https://api.atlassian.com"
  private oauthBaseUrl: string = "https://auth.atlassian.com/oauth/token"

  constructor(private credentials: IStrideCredentials) { }

  public async postMessage(conversationId: string, body: IStrideMessage) {
    const token   = await this.getAccessToken()
    const uri     = `${this.baseUri}/conversation/${conversationId}/message`
    const options = { uri, method: HTTP.Post, headers: this.buildHeaders(token), json: { body } }

    return rpn(options)
  }

  public async deleteMessage(conversationId: string, messageId: string) {
    const token   = await this.getAccessToken()
    const uri     = `${this.baseUri}/conversation/${conversationId}/message/${messageId}`
    const options = { uri, method: HTTP.Delete, headers: this.buildHeaders(token) }

    return rpn(options)
  }

  public async updateMessage(conversationId: string, messageId: string, body: IStrideMessage) {
    const token   = await this.getAccessToken()
    const uri     = `${this.baseUri}/conversation/${conversationId}/message/${messageId}`
    const options = { uri, method: HTTP.Put, headers: this.buildHeaders(token), json: { body } }

    return rpn(options)
  }

  public async getAccessToken(): Promise<string> {
    const accessToken = AccessToken.getInstance()

    if (!accessToken.isValid()) {
      const options = {
        uri: this.oauthBaseUrl,
        method: HTTP.Post,
        json: {
          grant_type: "client_credentials",
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
          audience: "api.atlassian.com",
        },
      }

      accessToken.update(await rpn(options))
    }

    return accessToken.token
  }

  private get baseUri(): string {
    return `${this.apiBaseUrl}/site/${this.credentials.cloudId}`
  }

  private buildHeaders(token: string) {
    return { "authorization": `Bearer ${token}`, "cache-control": "no-cache" }
  }

}
