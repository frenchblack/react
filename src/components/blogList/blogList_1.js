import styles from  "./blogList_1.module.css";
import { useState, useEffect, useRef } from "react"

function BlogList_1() {
    //된거여 뭐여
    const [list, setList] = useState([]);
    const [detail, setDetail] = useState({});
    const testList = () => {
        const testJson = [
            {title : "글자숫자테스트중임", commentCnt : 1233, img : "", summary : "테스트용 타이틀 1"}
            , {title : "타이틀2", commentCnt : 6, img : "", summary : "테스트용 타이틀 2 테스트용 타이틀 2 테스트용 타이틀 2 테스트용 타이틀 2테스트용 타이틀 2"}
            , {title : "타이틀3", commentCnt : 34, img : "", summary : "테스트용 타이틀 3 테스트용 타이틀 3 테스트용 타이틀 3 테스트용 타이틀 3테스트용 타이틀 3테스트용 타이틀 3테스트용 타이틀 3테스트용 타이틀 3"}
        ];

        setList(testJson);
        setDetail(testJson[0]);
    }

    useEffect(() => {
        testList();
    }, []);

    const listClick = (listItem) => {
        setDetail(listItem);
    }

    return (
        <div className={ styles.blogList_1 }>
            <div className={ styles.detail }>
                <h3 className={ styles.title }>{ detail.title }</h3>
                <p className={ styles.desc }>{ detail.summary }</p>
            </div>
            <ul className={ styles.list }>
                { list.map( (listItem) => (
                    <li onClick={ () => { listClick( listItem ) } } className={ styles.item }>
                        { listItem.title }
                        <div className={ styles.commentCnt }>[{listItem.commentCnt}]</div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export { BlogList_1 };