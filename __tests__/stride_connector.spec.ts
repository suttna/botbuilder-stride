import "jest"

import { Message, UniversalBot } from "botbuilder"
import * as nock from "nock"
import { AccessToken } from "../src/lib/access_token"
import { StrideConnector } from "../src/stride_connector"

describe("StrideConnector", () => {
  const connector = new StrideConnector({
    botId: "BOT_ID",
    botName: "Suttna",
    clientId: "CLIENT_ID",
    clientSecret: "CLIENT_SECRET",
    cache: {
      getCloudIdByBot: (botId: string) => Promise.resolve("CLOUD_ID"),
    },
  })

  let bot: UniversalBot
  let message: Message

  beforeEach(() => {
    bot = new UniversalBot(connector)

    message = new Message()
      .address({
        conversation: { id: "CONVERSATION_ID" },
        user: { id: "USER_ID" },
        bot: { id: "BOT_ID" },
        channelId: "stride",
      })
  })

  describe("when sending a message", () => {
    beforeEach(() => {
      const token = AccessToken.getInstance()

      token.update({
        access_token: "ACCESS_TOKEN",
        scope: "participate:conversation view:userprofile",
        expires_in: 3600,
        token_type: "Bearer",
      })
    })

    it("posts the message to Stride correctly", (done) => {
      const request = nock("https://api.atlassian.com")
        .post("/site/CLOUD_ID/conversation/CONVERSATION_ID/message")
        .reply(200, { id: "RESPONSE_ID" })

      bot.on("outgoing", () => {
        // "outgoing" is emitted before the API call :(
        setTimeout(() => {
          expect(request.isDone()).toBe(true)
          done()
        }, 100)
      })

      bot.send(message.text("Hey, I'm Suttna!"))
    })

    it("sends the correct JSON object to Stride", (done) => {
      const request = nock("https://api.atlassian.com")
        .post("/site/CLOUD_ID/conversation/CONVERSATION_ID/message", {
          body: {
            version: 1,
            type: "doc",
            content: [{type: "paragraph", content: [{type: "text", text: "Hey, I'm Suttna!"}]}],
          },
        })
        .reply(200, { id: "RESPONSE_ID" })

      bot.on("outgoing", () => {
        setTimeout(() => {
          expect(request.isDone()).toBe(true)
          done()
        }, 100)
      })

      bot.send(message.text("Hey, I'm Suttna!"))
    })

    describe("when there is no token stored", () => {
      beforeEach(() => {
        const token = AccessToken.getInstance()

        token.clear()
      })

      it("gets a new access token from Stride", (done) => {
        nock("https://api.atlassian.com")
          .post("/site/CLOUD_ID/conversation/CONVERSATION_ID/message")
          .reply(200, { id: "RESPONSE_ID" })

        const request = nock("https://auth.atlassian.com")
          .post("/oauth/token")
          .reply(200, { access_token: "NEW_ACCESS_TOKEN", expires_in: 3600 })

        bot.on("outgoing", () => {
          setTimeout(() => {
            expect(request.isDone()).toBe(true)
            done()
          }, 100)
        })

        bot.send(message.text("Hey, I'm Suttna!"))
      })

      it("stores the new token correctly", (done) => {
        nock("https://api.atlassian.com")
          .post("/site/CLOUD_ID/conversation/CONVERSATION_ID/message")
          .reply(200, { id: "RESPONSE_ID" })

        nock("https://auth.atlassian.com")
          .post("/oauth/token")
          .reply(200, { access_token: "NEW_ACCESS_TOKEN", expires_in: 3600 })

        bot.on("outgoing", () => {
          setTimeout(() => {
            expect(AccessToken.getInstance().token).toBe("NEW_ACCESS_TOKEN")
            done()
          }, 100)
        })

        bot.send(message.text("Hey, I'm Suttna!"))
      })
    })
  })
})
