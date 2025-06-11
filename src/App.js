import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header, Blogheader } from "containers";
import Home from "routes/common/Home"
import Login from "routes/common/Login";
import Join from "routes/common/Join"
import Blog from "routes/Blog";
import HeaderRoute from "routes/HeaderRoute";
import BlogRoute from "routes/BlogRoute";
import Menu from "routes/common/Menu";
import FreeBoard from "routes/board/FreeBoard";
import WriteBoard from "routes/board/WriteBoard";
import ViewBoard from "routes/board/ViewBoard";

function App() {
  return (
    <Router>
      {/* <Header /> */}
      <Routes>
        <Route element={ <HeaderRoute /> }>
          <Route path="/" element={ <Home /> } />
          <Route path="/login" element={ <Login /> } />
          <Route path="/join" element={ <Join /> } />
          <Route path="/menu" element={ <Menu /> } />
          <Route path="/freeBoard" element={ <FreeBoard /> } />
          <Route path=":base/WriteBoard" element={<WriteBoard />} />
          <Route path=":base/ViewBoard" element={<ViewBoard />} />
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
