import { Blogheader } from "containers"
import { Outlet } from "react-router-dom";

function BlogRoute () {
    return (
        <div>
            <Blogheader />
            <Outlet />
        </div>
    );
}

export default BlogRoute;