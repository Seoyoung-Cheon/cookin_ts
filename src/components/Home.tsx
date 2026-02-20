import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '') || '';
const SLIDE_IMAGES = ['bg1.png', 'bg2.png', 'bg3.png', 'bg4.png'].map(
    (name) => `${base}/assets/${name}`
);

const Home = () => {
    const navigate = useNavigate();

    const handleCookPress = () => {
        navigate('/search');
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <span className="home-brand">COOKIN</span>
            </header>

            <section className="home-tagline">
                <h1 className="home-tagline-text">당신의 레시피를 찾아보세요!</h1>
            </section>

            <section className="home-hero">
                <div className="home-hero-wrap">
                    {SLIDE_IMAGES.map((src, i) => (
                        <div
                            key={src}
                            className="home-hero-layer"
                            style={{
                                backgroundImage: `url(${src})`,
                                animationDelay: `${i * 3}s`,
                            }}
                        />
                    ))}
                </div>
                <div className="home-hero-overlay" />
                <div className="home-hero-shapes">
                    <div className="home-shape home-shape--tl" />
                    <div className="home-shape home-shape--tr" />
                    <div className="home-shape home-shape--br" />
                </div>
            </section>

            <section className="home-cta-section">
                <button
                    type="button"
                    className="home-cta-wrap"
                    onClick={handleCookPress}
                    aria-label="요리하기"
                >
                    <span className="home-cta-inner">요리하기</span>
                    <span className="home-cta-dashed" aria-hidden />
                    <span className="home-cta-ping home-cta-ping--tr" aria-hidden />
                    <span className="home-cta-ping home-cta-ping--bl" aria-hidden />
                    <span className="home-cta-ping home-cta-ping--m1" aria-hidden />
                    <span className="home-cta-ping home-cta-ping--m2" aria-hidden />
                </button>
            </section>
        </div>
    );
};

export default Home;
