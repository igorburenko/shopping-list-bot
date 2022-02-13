import User from '../../models/User.js'
import Family from '../../models/Family.js'
import TextConstants from '../TextConstants.js'
import View from '../view/View.js'
import { Scenes } from 'telegraf'


const joinFamilyScene = new Scenes.BaseScene('joinFamily')

joinFamilyScene.enter(async ctx => {
  const chatId = ctx.message.from.id
  const user = await User.findOne({ chatId }).populate('family', '_id')
  const botMessageId = user.botMessageId

  const view = new View(ctx, botMessageId)
  await view.removeUserMessage()
  if (!user){
    await ctx.scene.leave()
    return view.editUserMessage(TextConstants.ERROR_GENERAL)
  }

  if (user.family){
    await ctx.scene.leave()
    return view.editUserMessage(TextConstants.FAMILY_RESTORED + user.family._id)
  }

  await view.editUserMessage('Введите ваш инвайт код')
})

joinFamilyScene.leave(async ctx => {
  console.log('join family leave')
})

joinFamilyScene.hears('leave', async(ctx) => await ctx.scene.leave())

joinFamilyScene.on('text', onInviteCodeSend)

async function onInviteCodeSend(ctx) {
  try {
    const familyId = ctx.message.text
    console.log(ctx)

    const chatId = ctx.message.from.id
    const user = await User.findOne({ chatId }).populate('family', '_id')
    const botMessageId = user.botMessageId

    const view = new View(ctx, botMessageId)
    await view.removeUserMessage()

    const family = await Family.findByIdAndUpdate(familyId, {$push: { users: user._id }})
    await User.findOneAndUpdate({ chatId }, { $push: {family: family._id}})
    // await view.editUserMessage(TextConstants.FAMILY_CREATED + user.family._id)
  }
  catch (e) {
    ctx.reply('Something went wrong' +  e)
    console.log(e)
  }
  finally {
    await ctx.scene.leave()
  }
}

export default joinFamilyScene
