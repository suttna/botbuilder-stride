import { IAddress, Library, Message, UniversalBot } from "botbuilder"

export function directMessageLibrary(bot: UniversalBot): Library {
  const library = new Library("direct-message")

  library.dialog("/", (session, args) => {
    const address = JSON.parse(JSON.stringify(session.message.address))

    bot.connector("stride").startConversation(address, (err: Error, newAddress: IAddress) => {
      if (!err) {
        const message = new Message().address(newAddress).text("We can talk here too :D")

        bot.send(message, (err2) => {
          if (err2) {
            console.error(err2)
          }
        })
        session.endDialog()
      } else {
        console.error(err)
      }
    })
  })
  .triggerAction({ matches: "direct-message" })

  return library
}
