import User from '../../models/User.js'
import Family from '../../models/Family.js'
import TextConstants from '../TextConstants.js'
import View from '../view/View.js'

export default async (ctx) => {

  try {
    const chatId = ctx.message.from.id
    const user = await User.findOne({ chatId }).populate('family', '_id')
    const botMessageId = user.botMessageId
    const view = new View(ctx, botMessageId)

    await view.removeUserMessage()

    if (!user)
      return view.editUserMessage(TextConstants.ERROR_GENERAL)

    if (user.family)
      return view.editUserMessage(TextConstants.FAMILY_RESTORED + user.family._id)

    const newFamily = await createNewFamily(user._id)
    await User.findOneAndUpdate({ chatId: chatId}, { family: newFamily._id})
    await view.editUserMessage(TextConstants.FAMILY_CREATED + user.family._id)
  }
  catch (e) {
    ctx.reply('Something went wrong' +  e)
    console.log(e)
  }
}

const createNewFamily = (userId, familyName='my family') => {
  return new Family({
    name: familyName,
    users: [userId],
  }).save()
}
