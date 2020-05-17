const express = require('express')
const connectDB = require('./config/db') // connect with DB

const app = express()

// run the connectDB
connectDB()

// Init middleware in order to support express to get the body without express bodyParser
app.use(express.json({ extended: false }))

app.use('/api/users', require('./routes/users'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/contacts', require('./routes/contacts'))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}...`)
})
