const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const { check, validationResult } = require('express-validator')

const Contact = require('../models/Contact')
const User = require('../models/User')

/**
 *  @route        GET api/contacts
 *  @description  Get all user contacts
 *  @access       Private ==> every private access should using auth middleware
 */
router.get('/', auth, async (req, res) => {
  try {
    // get contacts from DB
    const contacts = await Contact.find({ user: req.user.id }).sort({
      date: -1,
    })
    res.send(contacts)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

/**
 *  @route        POST api/contacts
 *  @description  Create new user contact
 *  @access       Private
 */
router.post(
  '/',
  [auth, [check('name', 'Please input contact name').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // get the body
    const { name, email, phone, type } = req.body

    try {
      const newContact = new Contact({
        name,
        email,
        phone,
        type,
        user: req.user.id,
      })

      const contact = await newContact.save()
      res.send(contact)
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server Error')
    }
  }
)

/**
 *  @route        PUT api/contacts/:id
 *  @description  Update Contact
 *  @access       Private
 */
router.put('/:id', auth, async (req, res) => {
  const { name, email, phone, type } = req.body

  // create contact object
  const contactField = {}
  if (name) contactField.name = name
  if (email) contactField.email = email
  if (phone) contactField.phone = phone
  if (type) contactField.type = type

  try {
    let contact = await Contact.findById(req.params.id)

    if (!contact) {
      return res.status(404).json({ msg: 'Contact not found' })
    }

    // make sure user owns contacts by compare user ID from
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Unauthorize' })
    }

    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: contactField },
      { new: true }
    )
    res.json(contact)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

/**
 *  @route        DELETE api/contacts/:id
 *  @description  Delete Contact
 *  @access       Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id)

    if (!contact) {
      return res.status(404).json({ msg: 'Contact not found' })
    }

    // make sure user owns contacts by compare user ID from
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Unauthorize' })
    }

    await Contact.findByIdAndRemove(req.params.id)
    res.json({ msg: 'Contact Removed' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
