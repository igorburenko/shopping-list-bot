import TextConstants from '../TextConstants.js'
import User from '../../models/User.js'

export default async (ctx) => {
  try {
    const chatId = ctx.message.from.id
    const currentUser = await User.findOne({ chatId })

    if (!currentUser) {
      const reply = await ctx.reply(TextConstants.START_MESSAGE_NEW_USER)
      const result = await createNewUser(reply.message_id, reply.chat.id)

      if (result.chatId == chatId)
        return console.log('user created')
    }

    const reply = await ctx.reply(TextConstants.START_MESSAGE_OLD_USER)
    const result = await User.findOneAndUpdate({ chatId: reply.chat.id}, { botMessageId: reply.message_id})
    //todo: проверить есть ли у юзера семья, если нет - предложить создать или добавиться в существующую
    if (result.chatId == chatId)
      console.log('user updated')
  }
  catch (e) { console.log(e) }
}

const createNewUser = (botMessageId, chatId) => {
  return new User({
    botMessageId: botMessageId,
    chatId: chatId
  }).save()
}
