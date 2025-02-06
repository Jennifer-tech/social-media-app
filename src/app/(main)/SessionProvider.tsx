"use client"

import { Session, User } from "lucia";
import { createContext, useContext } from "react";

// context provider is a way to take a value and make it available
// to our child components without having to pass the prop through all components


// these are what we are getting from our alidate function, we can't get null because
// when it's done, we will be redirected to login
interface SessionContext{
    user: User;
    session: Session;
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
    children,
    value,
} : React.PropsWithChildren<{ value: SessionContext }>) {
    return (
        <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
    )
}


export function useSession() {
    const context = useContext(SessionContext);

    if(!context) {
        throw new Error("useSession must be used within a sessionProvider");
    }
    return context;
}