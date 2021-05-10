import env from 'dotenv'
import { Telegraf } from 'telegraf'
import Helper from './helper.js'
import {generateProductButtons} from './generateKeyboards.js';
import TextConstants from './TextConstants.js';
import mongoose from 'mongoose'
import Family from './../models/Family.js'
import User from './../models/User.js'
import http from 'http'

http.createServer().listen(process.env.PORT || 5000).on('request', function(req, res){
  res.end('')
});

// import express from 'express'
// const app = express()
// const port = process.env.PORT || 3000
//
// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })
//
// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// })
//

env.config({path: '.env'})

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
  .then(()=>console.log('DB connected'))
  .catch(e=>console.log(e))

let toBuy = []
let botMessageId = null
let botChatId = null

const bot = new Telegraf(process.env.TOKEN)
Helper.logStart()

bot.start(async (ctx) => {
  const reply = await ctx.reply(TextConstants.START_MESSAGE)

  const result = await User.findOne({ chatId: reply.chat.id})

  if (!result)
    createNewUser(reply.message_id, reply.chat.id)
      .then(user => createNewFamily(user._id))
      .then(res => User.findOneAndUpdate({ chatId: reply.chat.id}, { family: res._id}))
      .then(console.log('user created'))
      .catch(e => console.log(e))
  else
    User.findOneAndUpdate({ chatId: reply.chat.id}, { botMessageId: reply.message_id})
      .then(console.log('user updated'))
      .catch(e => console.log(e))
  }
)

bot.on('text', async ctx => {
  try {
    const chatId = ctx.update.message.from.id
    const { productsToBuy, botMessageId, familyId } = await getUserData(chatId)

    if (productsToBuy.length === 0)
      await bot.telegram.editMessageText(chatId, botMessageId, null, TextConstants.LIST_HAVE_PRODUCTS)

    //todo: сократить название продукта до 15 символов
    const newProducts = ctx.message.text.split(',').map(product => product.trim())
    const newProductsToBuy = [...productsToBuy, ...newProducts]
    await Family.updateOne({})

    const keyboard = { inline_keyboard: generateProductButtons(newProductsToBuy) }
    bot.telegram.editMessageReplyMarkup(chatId, botMessageId, null, keyboard)

    const userMessageId = ctx.update.message.message_id
    bot.telegram.deleteMessage(chatId, userMessageId)

    await Family.findByIdAndUpdate(familyId, { productsToBuy: newProductsToBuy })
  }
  catch (e) { console.log(e) }
})

bot.on('callback_query', async ctx => {
  try {
    const chosenProduct = ctx.callbackQuery.data
    const chatId = ctx.callbackQuery.from.id

    const { productsToBuy, botMessageId, familyId } = await getUserData(chatId)

    const newProductsToBuy = productsToBuy.filter(product => product !== chosenProduct)

    if (newProductsToBuy.length === 0)
      await bot.telegram.editMessageText(chatId, botMessageId, null, TextConstants.LIST_IS_EMPTY)

    const keyboard = {inline_keyboard: generateProductButtons(newProductsToBuy)}
    await bot.telegram.editMessageReplyMarkup(chatId, botMessageId, null, keyboard)

    await Family.findByIdAndUpdate(familyId, { productsToBuy: newProductsToBuy })
  }
  catch (e) { console.log(e) }
})


bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))


const createNewUser = (botMessageId, chatId) => {
   return new User({
    botMessageId: botMessageId,
    chatId: chatId
  }).save()
}
const createNewFamily = (userId, familyName='my family', ) => {
   return new Family({
     name: familyName,
     users: [userId],
  }).save()
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
