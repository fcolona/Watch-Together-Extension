import { Router, Request, Response } from 'express'
const routes = Router()
import server from './server'

const io = require("socket.io")(server);
routes.get('/', (req: Request, res: Response) => {
    res.send("Hello World!")
})

export default routes