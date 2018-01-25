import { Library, Message, UniversalBot } from "botbuilder"

export function deleteMessageLibrary(bot: UniversalBot): Library {
  const library = new Library("delete")

  library.dialog("/", (session, args) => {
    const address = JSON.parse(JSON.stringify(session.message.address))
    const message = new Message().address(address).text("Have you asked me to delete a message?").toMessage()

    bot.send(message, (err, addresses) => {
      bot.connector("stride").delete(addresses[0], (err2) => {
        if (err2) {
          console.error(err2)
        }
      })
    })
  })
  .triggerAction({ matches: "delete" })

  return library
}
