import * as bodyParser from "body-parser"
import { Message, UniversalBot } from "botbuilder"
import { StrideConnector } from "botbuilder-stride"
import * as express from "express"

const port = process.env.PORT || 8080

const settings = {
  botId: process.env.STRIDE_BOT_ID,
  botName: process.env.STRIDE_BOT_NAME,
  clientId: process.env.STRIDE_CLIENT_ID,
  clientSecret: process.env.STRIDE_CLIENT_SECRET,
  cache: {
    getCloudIdByBot: async () => {
      return Promise.resolve(process.env.SUTTNA_BOT_CLOUD_ID)
    },
  },
}

const connector = new StrideConnector(settings)
const bot = new UniversalBot(connector)

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

bot.dialog("/", (session) => {
  console.info(session.message)

  bot.send(session.message, (err, addresses) => {
    if (session.message.text === "update") {
      const message = new Message().address(addresses[0]).text(`${session.message.text} edited`).toMessage()

      connector.update(message, (err2, newAddress) => {
        console.error(err2)
        console.info(newAddress)
      })
    } else if (session.message.text === "delete") {
      connector.delete(addresses[0], (err2) => {
        console.error(err2)
      })
    }
  })
})

app.listen(port, () => {
  console.log(`Bot is listening on port ${port}`)
})

app.post("/stride/bot-(mention|direct-message)", connector.listenEvents())
