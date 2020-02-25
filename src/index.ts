import { ApiServer } from './ApiServer';
import "reflect-metadata";


const PORT = 80;
const server = new ApiServer();
server.run(PORT);