import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header, Blogheader } from "containers";
import Home from "routes/common/Home"
import Login from "routes/common/Login";
import Join from "routes/common/Join"
import Blog from "routes/Blog";
import HeaderRoute from "routes/HeaderRoute";
import BlogRoute from "routes/BlogRoute";
import Menu from "routes/manage/Menu";
import Category from "routes/manage/Category";
import FreeBoard from "routes/board/FreeBoard";
import WriteBoard from "routes/board/WriteBoard";
import ViewBoard from "routes/board/ViewBoard";
import AdminRoute from "routes/AdminRoute";
import { RouteTracker } from "components";

function App() {
  return (
    <Router>
      <RouteTracker />
      {/* <Header /> */}
      <Routes>
        <Route element={ <HeaderRoute /> }>
          <Route path="/" element={ <Home /> } />
          <Route path="/login" element={ <Login /> } />
          <Route path="/join" element={ <Join /> } />
            <Route element={<AdminRoute />}>
              <Route path="/menu" element={<Menu />} />
              <Route path="/manageCategory" element={<Category />} />
            </Route>
          <Route path="/board/:menu_cd" element={ <FreeBoard /> } />
          <Route path="/board/:menu_cd/WriteBoard" element={ <WriteBoard /> } />
          <Route path="/board/:menu_cd/ViewBoard" element={ <ViewBoard /> } />
        </Route>
        <Route path="/blog/*" element={ <BlogRoute /> } >
            <Route path=":bloger_id" element={ <Blog /> } />
            <Route path="bbb/aaa" element={ <Login /> } />
        </Route>

        {/* <Route path="/blog/:bloger_id" element={ <Blog /> } /> */}
        
        {/* <Route path="/blog/aaa/*" element={ <Login /> } /> blog/뒤에 게시글등등 번호 들어와야할떄 /blog/board/*(글번호)로 해두면 board붙은건 게시글로 넘어감 */}
      </Routes>
    </Router>
  );
}

export default App;
