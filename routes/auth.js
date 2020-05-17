const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
// import from middleware
const auth = require('../middleware/auth')
const { check, validationResult } = require('express-validator')

const router = express.Router()

const User = require('../models/User')

/**
 *  @route        GET api/auth
 *  @description  Get Logged in User
 *  @access       Private
 */
// pass middleware as 2nd param
router.get('/', auth, async (req, res) => {
  try {
    // get user from DB without password
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

/**
 *  @route        POST api/auth
 *  @description  Auth User & get token
 *  @access       Public
 */
router.post(
  '/',
  [
    // check login (only using email & password)
    check('email', 'Please input valid email').isEmail(),
    check('password', 'Please input valid password').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body
    try {
      // check is user valid by email
      let user = await User.findOne({ email })

      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credential' })
      }

      // check password match using bcrypt
      let isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credential' })
      }

      // if email & password OK then get the token using JWT
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
