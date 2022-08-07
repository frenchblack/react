import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header, Blogheader } from "containers";
import Home from "routes/Home"
import Login from "routes/Login";
import Join from "routes/Join"
import Blog from "routes/Blog";
import HeaderRoute from "routes/HeaderRoute";
import BlogRoute from "routes/BlogRoute";

function App() {
  return (
    <Router>
      {/* <Header /> */}
      <Routes>
        <Route element={ <HeaderRoute /> }>
          <Route path="/" element={ <Home /> } />
          <Route path="/login" element={ <Login /> } />
          <Route path="/join" element={ <Join /> } />
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
