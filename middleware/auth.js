// middleware is a just function that has access to request & response
// create middleware allow us to send token within headers to access user data after login

const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = function (req, res, next) {
  // get token from the header
  const token = req.header('x-auth-token')

  // check if token exist
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' })
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'))

    req.user = decoded.user
    next()
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' })
  }
}
