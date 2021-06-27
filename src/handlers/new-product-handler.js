import Family from '../../models/Family.js'
import User from '../../models/User.js'
import getProductsFromMessage from '../util/getProductsFromMessage.js'
import View from '../view/View.js'

export default async (ctx) => {
  try {
    const chatId = ctx.message.from.id
    const { productsToBuy: oldProductsToBuy, botMessageId, familyId } = await getUserData(chatId)
    const newProducts = getProductsFromMessage(ctx.message.text)
    const newProductsToBuy = [...oldProductsToBuy, ...newProducts]
    const family = await Family.findByIdAndUpdate(familyId, { productsToBuy: newProductsToBuy })
      .populate('users', ['botMessageId', 'chatId'])

    const view = new View(ctx, botMessageId, chatId)
    await view.removeUserMessage()
    if (family) {
      for (const user of family.users) {
        const userView = new View(ctx, user.botMessageId, user.chatId)
        await userView.updateProductsInFamily(newProductsToBuy)
      }
    }
  }
  catch (e) { console.log(e) }
}

const getUserData = async (chatId) => {
  const user =
    await User
      .findOne({ chatId: chatId })
      .populate('family', 'productsToBuy')

  const productsToBuy = user.family.productsToBuy
  const { botMessageId } = user
  return { productsToBuy, botMessageId, familyId: user.family._id }
}
