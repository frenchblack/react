import styles from  "./Home.module.css";
import { BlogList_1 } from "components"

function Home() {
    return (
        <div className={`${ styles.Home } container`}>
          <div className={ `${ styles.anything}` }>
            여기에 뭘 입력하지
          </div>
          <div className={ `${ styles.hot_content }` }>
            <div className={ styles.list_container }>
              <h2>최다 조회</h2>
              <div className={ `${styles.list} content_box` }>
                <BlogList_1 />
              </div>
            </div>
            <div className={ styles.list_container }>
            <h2>최다 조회</h2>
              <div className={ `${styles.list} content_box` }>
                <BlogList_1 />
              </div>
            </div>
          </div>
          <div className={ `${styles.category} content_box` }>

          </div>
        </div>
      );
}

export default Home;