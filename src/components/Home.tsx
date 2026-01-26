import { useNavigate } from 'react-router-dom';
import '../styles/home.css';
import logoImage from '/assets/logo (3).png';

const Home = () => {
  const navigate = useNavigate();

  const handleCookPress = () => {
    navigate('/search');
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <img src={logoImage} alt="COOKIN Logo" className="home-logo" />
        <h1 className="home-title">COOKIN에 오신 것을 환영합니다</h1>
        <button className="home-button" onClick={handleCookPress}>
          <svg
            className="home-button-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          요리하기
        </button>
      </div>
    </div>
  );
};

export default Home;
