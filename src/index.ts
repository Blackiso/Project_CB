import { ApiServer } from './ApiServer';
import { SocketServer } from './websocket/SocketServer';
import * as http from 'http';
import { container } from "tsyringe";
import "reflect-metadata";

const PORT = 80;
const apiServer = new ApiServer();
const websocket = container.resolve(SocketServer);
const httpServer = http.createServer(apiServer.express);

httpServer.listen(PORT);
websocket.init(httpServer);