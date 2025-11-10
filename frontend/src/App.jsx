import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Search from './pages/Search.jsx';
import Profile from './pages/Profile.jsx';
import Upload from './pages/Upload.jsx';
import Eval from './pages/Eval.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-logo">🔓 VulnLab</h1>
            <ul className="nav-menu">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/search">Búsqueda</Link></li>
              <li><Link to="/profile/1">Perfil</Link></li>
              <li><Link to="/upload">Subir Archivo</Link></li>
              <li><Link to="/eval">Eval</Link></li>
            </ul>
          </div>
        </nav>

        {/* Contenido Principal */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/eval" element={<Eval />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="footer">
          <p>⚠️ VulnLab - Aplicación Intencionalmente Vulnerable para Fines Educativos</p>
          <p>Universidad UPC - Auditoría de Sistemas 2025</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
