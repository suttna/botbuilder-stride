import * as bodyParser from "body-parser"
import { IIntentRecognizerResult, UniversalBot } from "botbuilder"
import { StrideConnector } from "botbuilder-stride"
import * as express from "express"
import * as dialogs from "./dialogs"

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
const bot       = new UniversalBot(connector)
const app       = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

const COMMANDS = ["direct-message", "update", "delete"]

// Detect possible commands
bot.recognizer({
  recognize: (context, done) => {
    const match   = context.message.text.match(/^(?:@.+ )?(.+)$/)
    const command = match ? COMMANDS.find((c) => c === match[1]) : null

    if (!command) {
      return done(null, { score: 0.0 } as IIntentRecognizerResult)
    }

    return done(null, { score: 1.0, intent: command })
  },
})

dialogs.initialize(bot)

// Default dialog
bot.dialog("/", (session) => {
  session.endDialog("Hey there!")
})

app.listen(port, () => {
  console.log(`Bot is listening on port ${port}`)
})

app.post("/installed", (req, res, next) => {
  res.send(200)
  next()
})

app.post("/stride/bot-(mention|direct-message)", connector.listenEvents())
