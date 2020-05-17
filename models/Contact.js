const mongoose = require('mongoose')

const ContactSchema = mongoose.Schema({
  // create relation between user & their contact
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', // users is the collection name in our mongo collection
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  type: {
    type: String,
    default: 'personal',
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('contact', ContactSchema)
