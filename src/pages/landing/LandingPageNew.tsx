import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturesGrid from './components/FeaturesGrid';
import FeaturesChess from './components/FeaturesChess';
import LearningPreview from './components/LearningPreview';
import Stats from './components/Stats';
import StartSection from './components/StartSection';
import CtaFooter from './components/CtaFooter';
import './Landing.css';

const LandingPageNew = () => {
  return (
    <div className="landing-page-root min-h-screen">
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <FeaturesGrid />
          <FeaturesChess />
          <LearningPreview />
          <Stats />
          <StartSection />
        </main>
        <CtaFooter />
      </div>
    </div>
  );
};

export default LandingPageNew;