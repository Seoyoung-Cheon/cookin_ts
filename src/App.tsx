import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import RecipeSearch from './components/RecipeSearch';
import RecipeDetail from './components/RecipeDetail';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<RecipeSearch />} />
        <Route path="/detail" element={<RecipeDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
