import { Library, Message, UniversalBot } from "botbuilder"

export function updateMessageLibrary(bot: UniversalBot): Library {
  const library = new Library("update")

  library.dialog("/", (session, args) => {
    const address = JSON.parse(JSON.stringify(session.message.address))
    const message = new Message().address(address).text("Have you asked me to update a message?").toMessage()

    bot.send(message, (err, adresses) => {
      const updatedMsg = new Message().address(adresses[0]).text("Ok, I've just updated it :)").toMessage()

      bot.connector("stride").update(updatedMsg, (err2) => {
        if (err2) {
          console.error(err2)
        }
      })
    })
  })
  .triggerAction({ matches: "update" })

  return library
}
