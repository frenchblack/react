import { useState } from "react";
import styles from "./Sample.module.css";

function Home() {
  const [id, setId] = useStateate("");

  return (
    <div className={`${ styles.Home } container`}>
      
    </div>
  );
}

export default Home;