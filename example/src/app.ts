import * as bodyParser from "body-parser"
import { UniversalBot } from "botbuilder"
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

  session.say(session.message.text)
})

app.listen(port, () => {
  console.log(`Bot is listening on port ${port}`)
})

app.post("/stride/bot-(mention|direct-message)", connector.listenEvents())
