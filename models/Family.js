import mongoose from 'mongoose'

const { Schema, model } = mongoose

const schema = new Schema({
  name: {
    type: String
  },
  productsToBuy: {
    type: Array,
    default: ['персик', 'ябке']
  },
  users : [{ type: Schema.Types.ObjectId, ref: 'User' }]
})

export default model('Family', schema)
