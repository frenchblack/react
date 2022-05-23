import { createContext, useState } from "react";

export const AuthContext = createContext({
    _isAuthorization : false
    , _setIsAuthorizationHandler : (_isAuthorization) => {}
});

const AuthContextProvider = ({ children }) => {
    const [_isAuthorization, setIsAuth] = useState(false);

    const _setIsAuthorizationHandler = (_isAuthorization) => setIsAuth(_isAuthorization);

    return (
        <AuthContext.Provider value={{_isAuthorization , _setIsAuthorizationHandler}}>
            { children }
        </AuthContext.Provider>    
    );
}

export {AuthContextProvider};


