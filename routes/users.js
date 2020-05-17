const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')

const router = express.Router()

const User = require('../models/User')

/**
 *  @route        POST api/users
 *  @description  Register a User
 *  @access       Public
 */
router.post(
  '/',
  [
    // checker
    check('name', 'Please input the name').not().isEmpty(),
    check('email', 'Please input a valid email').isEmail(),
    check(
      'password',
      'Please input password with minimum 6 characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // req.body contain name, email, password to post it as sign up data
    const { name, email, password } = req.body

    // dealing with DB is return a promise so we use async await or .then.catch
    try {
      // bring the model (User) here
      // find user by email because email is unique
      let user = await User.findOne({ email })

      // check if user by email already exist
      if (user) {
        return res.status(400).json({ msg: 'User already exists' })
      }
      // create new User
      user = new User({ name, email, password })

      // encrypt the password using bcrypt, & bcrypt return a promise so we can use await
      const salt = await bcrypt.genSalt(10)

      // encrypt the password
      user.password = await bcrypt.hash(password, salt)

      // save it to DB
      await user.save()

      /**
       * create auto-login after register using JWT
       */
      const payload = {
        user: {
          id: user.id,
        },
      }

      // generate token =>  using token above; create secret inside config/default.json; options object; callback
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 3600,
        },
        (err, token) => {
          if (err) throw err
          res.json({ token })
        }
      )
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
)

module.exports = router
