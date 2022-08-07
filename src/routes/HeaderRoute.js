import { Header } from "containers"
import { Outlet } from "react-router-dom";

function HeaderRoute () {
    return (
        <div>
            <Header />
            <Outlet />
        </div>
    );
}

export default HeaderRoute;