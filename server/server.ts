import * as path from 'path'
import express from 'express'

const http = require('http')
const app = express()
const server = http.createServer(app)
export default server

import routes from './routes'

app.use(routes)

const PORT = 3000 || process.env.PORT
server.listen(PORT, () => {
    console.log(`Server runnig on port: ${PORT}`)
})