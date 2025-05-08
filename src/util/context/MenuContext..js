import { createContext, useState, useEffect } from 'react';
import { nonAuthGet } from 'util';

export const MenuContext = createContext();

const MenuContextProvider = ({ children }) => {
  const [menuList, setMenuList] = useState([]);

  const getMenuList = async () => {
    try {
      const res = await nonAuthGet("/getChildMenuList");
      console.log("Context MenuList");
      console.log(res.data);
      setMenuList(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getMenuList();
  }, []);

  return (
    <MenuContext.Provider value={{ menuList }}>
      {children}
    </MenuContext.Provider>
  );
}

export {MenuContextProvider};