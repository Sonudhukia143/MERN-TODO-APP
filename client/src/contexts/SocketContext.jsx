import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        if (token) {
            const newSocket = io('https://to-do-task-manager.onrender.com', {
                auth: { token }
            });

            newSocket.on('connect', () => {
                console.log('Connected to server');
                setConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('Disconnected from server');
                setConnected(false);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        }
    }, [token]);

    const value = {
        socket,
        connected
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};