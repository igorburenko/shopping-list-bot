import env from 'dotenv'
import {Telegraf, Scenes, session} from 'telegraf'
import Helper from './helper.js'
import mongoose from 'mongoose'
import http from 'http'
import start from './handlers/start.js'
import createFamily from './handlers/create-family.js'
import joinFamilyScene from './handlers/joinFamilyScene.js'
import newProductHandler from './handlers/new-product-handler.js'
import callbackHandler from './handlers/callback-handler.js'

http.createServer().listen(process.env.PORT || 5000).on('request', function(req, res){
  res.end('')
});

env.config({path: '.env'})

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
  .then(()=>Helper.dbConnected())
  .catch(e=>console.log(e))

const bot = new Telegraf(process.env.TOKEN)
Helper.logStart()

const stage = new Scenes.Stage([
  joinFamilyScene,
])

bot.use(session())
bot.use(stage.middleware())

bot.start(start)
bot.hears('/create_family', createFamily)
bot.command('/join_family', (ctx) => {
  // console.log(ctx.scene)
  ctx.scene.enter('joinFamily')
    .then().catch (e => console.log(e))
})

bot.hears('/invite_code', (ctx) => ctx.reply('Create'))
bot.hears('/leave_family', (ctx) => ctx.reply('Create'))

bot.on('text', newProductHandler)
bot.on('callback_query', callbackHandler)


bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))


export const updateFamilyProducts = async(newProductsToBuy, productsToBuy) => {

}
