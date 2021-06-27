import TextConstants from '../TextConstants.js'
import {generateProductButtons} from '../generateKeyboards.js'

export default class View {
  constructor(context, botMessageId, chatId) {
    this.context = context
    this.botMessageId = botMessageId
    this.chatId = chatId
  }

  async removeUserMessage() {
    try {
      const currentUserMessageId = this.context.message.message_id
      return await this.context.deleteMessage(currentUserMessageId)
    }
    catch (e) {
      console.log(e)
    }
  }

  async updateProductsInFamily(newProductsToBuy) {
    try {
      // await this.editUserMessage(TextConstants.LIST_HAVE_PRODUCTS)

      const keyboard = {inline_keyboard: generateProductButtons(newProductsToBuy)}
      await this.editUserKeyboard(keyboard)
    }
    catch (e) {
      console.log(e)
    }
  }

  async editUserMessage(text) {
    const data = this.context.message || this.context.callbackQuery
    const chatId = data.from.id
    // todo: найти как можно получить сообщение по id не изменять его если нету изменений

    try {
      const editedText = await this.context.tg.editMessageText(chatId, this.botMessageId, null, text)
    }
    catch (e) {
      console.log(e)
    }
  }

  async editUserKeyboard(keyboard) {
    try {
      await this.context.tg.editMessageReplyMarkup(this.chatId, this.botMessageId, null, keyboard)
    }
    catch (e) {
      console.log(e)
    }
  }

}
