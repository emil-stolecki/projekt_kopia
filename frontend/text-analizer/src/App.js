import './css/App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Empty from './pages/Empty.js';
import Home from './pages/Home.js';
import History from './pages/History.js'
import Feedback from './pages/Feedback.js'
import Info from './pages/Info.js'
import Details from './pages/Details.js';

function App() {

  return (    
    <Router>
      <Routes>
        <Route path="/" element={<Empty/>}/>
        <Route path="/home" element={<Home />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/info" element={<Info />} />
        <Route path="/history" element={<History />} />
        <Route path="/details" element={<Details />} />
      </Routes>
    </Router>  
  
);
}

export default App;
