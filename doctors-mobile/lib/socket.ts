import { io } from 'socket.io-client';

const URL = "https://backend.dentalicons.in";
export const socket = io(URL);