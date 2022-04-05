import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "containers";
import Home from "routes/Home"
import Login from "routes/Login";
import Join from "routes/Join"

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={ <Home /> } />
        <Route path="/login" element={ <Login /> } />
        <Route path="/join" element={ <Join /> } />
      </Routes>
    </Router>
  );
}

export default App;
