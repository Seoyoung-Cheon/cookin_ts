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
            <div className="home-title-rainbow">
                <span className="rainbow-letter" style={{ '--index': 0 } as React.CSSProperties}>C</span>
                <span className="rainbow-letter" style={{ '--index': 1 } as React.CSSProperties}>O</span>
                <span className="rainbow-letter" style={{ '--index': 2 } as React.CSSProperties}>O</span>
                <span className="rainbow-letter" style={{ '--index': 3 } as React.CSSProperties}>K</span>
                <span className="rainbow-letter" style={{ '--index': 4 } as React.CSSProperties}>I</span>
                <span className="rainbow-letter" style={{ '--index': 5 } as React.CSSProperties}>N</span>
            </div>
            <div className="home-content">
                <img src={logoImage} alt="COOKIN Logo" className="home-logo" />
                <h1 className="home-title">COOKIN에 오신 것을 환영합니다</h1>
                <button className="home-button" onClick={handleCookPress}>

                    요리하기
                </button>
            </div>
        </div>
    );
};

export default Home;
