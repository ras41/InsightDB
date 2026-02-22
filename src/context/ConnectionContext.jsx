import { createContext, useContext, useState } from 'react';

const ConnectionContext = createContext(null);

export function ConnectionProvider({ children }) {
    const [activeConnection, setActiveConnection] = useState(() => {
        const saved = localStorage.getItem('activeConnection');
        return saved ? JSON.parse(saved) : null;
    });

    const setConnection = (connection) => {
        setActiveConnection(connection);
        if (connection) {
            localStorage.setItem('activeConnection', JSON.stringify(connection));
        } else {
            localStorage.removeItem('activeConnection');
        }
    };

    const clearConnection = () => {
        setActiveConnection(null);
        localStorage.removeItem('activeConnection');
    };

    return (
        <ConnectionContext.Provider value={{ activeConnection, setConnection, clearConnection }}>
            {children}
        </ConnectionContext.Provider>
    );
}

export function useConnection() {
    const context = useContext(ConnectionContext);
    if (!context) throw new Error('useConnection must be used within ConnectionProvider');
    return context;
}
