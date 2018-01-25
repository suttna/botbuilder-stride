import { UniversalBot } from "botbuilder"
import { deleteMessageLibrary } from "./delete_message"
import { directMessageLibrary } from "./direct_message"
import { updateMessageLibrary } from "./update_message"

export function initialize(bot: UniversalBot) {
  bot.library(directMessageLibrary(bot))
  bot.library(updateMessageLibrary(bot))
  bot.library(deleteMessageLibrary(bot))
}
