import { io } from 'socket.io-client';

const URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
export const socket = io(URL);