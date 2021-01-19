const express = require('express')
const app = express()
const port = 3000
app.get('/', function (req, res) { 
  res.send('Hello World!')
})
app.listen(port, function () {
  process.send('ready')
  console.log(`application is listening on port ${port}...`)
})
process.on('SIGINT', function () {
  app.close(function () {
  console.log('server closed')
  process.exit(0)
  })
})
