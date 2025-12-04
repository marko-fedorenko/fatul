import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import UrlAnalysis from './UrlAnalysis';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/url-analysis" element={<UrlAnalysis />} />
      </Routes>
    </Router>
  );
}

export default App;
