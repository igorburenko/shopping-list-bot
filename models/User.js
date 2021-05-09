import mongoose from 'mongoose'

const { Schema, model } = mongoose

const schema = new Schema({
  botMessageId: {
    type: Number,
    required: true
  },
  chatId: {
    type: Number,
    required: true,
    unique: true
  },
  family : { type: Schema.Types.ObjectId, ref: 'Family' }
})

export default model('User', schema)
