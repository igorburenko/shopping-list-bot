import Family from '../../models/Family.js'
import View from '../view/View.js'
import User from '../../models/User.js'

export default async ctx => {
  try {
    const chosenProduct = ctx.callbackQuery.data
    const chatId = ctx.callbackQuery.from.id

    const {productsToBuy, familyId} = await getUserData(chatId)

    const newProductsToBuy = productsToBuy.filter(product => product !== chosenProduct)
    const family = await Family.findByIdAndUpdate(familyId, {productsToBuy: newProductsToBuy})
      .populate('users', ['botMessageId', 'chatId'])

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
