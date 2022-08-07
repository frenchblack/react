import styles from "./Blog.module.css";
import { useParams } from "react-router-dom";

function Blog (props) {
    const { bloger_id  } = useParams();

    return (
        <div className={ ["container", styles.blog_home].join(' ') }>
            a<br />b<br />c<br />d<br />e<br />f<br />g<br />h<br />i<br />j<br />k<br />l<br />m<br />
        </div>
    );
}
export default Blog;