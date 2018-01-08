import * as rpn from "request-promise-native"
import { IStrideCredentials } from "../stride_connector"
import { AccessToken } from "./access_token"

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
    const options = { uri, method: "POST", headers: this.buildHeaders(token), json: { body } }

    return rpn(options)
  }

  public async getAccessToken(): Promise<string> {
    const token = AccessToken.getInstance()

    if (!token.isValid()) {
      const options = {
        uri: this.oauthBaseUrl,
        method: "POST",
        json: {
          grant_type: "client_credentials",
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
          audience: "api.atlassian.com",
        },
      }

      token.update(await rpn(options))
    }

    return token.value
  }

  private get baseUri(): string {
    return `${this.apiBaseUrl}/site/${this.credentials.cloudId}`
  }

  private buildHeaders(token: string) {
    return { "authorization": `Bearer ${token}`, "cache-control": "no-cache" }
  }

}
