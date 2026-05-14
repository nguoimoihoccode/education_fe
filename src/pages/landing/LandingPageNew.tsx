import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LearningPreview from './components/LearningPreview';
import StartSection from './components/StartSection';
import FeaturesChess from './components/FeaturesChess';
import FeaturesGrid from './components/FeaturesGrid';
import Stats from './components/Stats';
import Testimonials from './components/Testimonials';
import CtaFooter from './components/CtaFooter';
import './Landing.css';

const LandingPageNew = () => {
  return (
    <div className="landing-page-root bg-black min-h-screen">
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <LearningPreview />
        <div className="bg-black">
          <StartSection />
          <FeaturesChess />
          <FeaturesGrid />
          <Stats />
          <Testimonials />
          <CtaFooter />
        </div>
      </div>
    </div>
  );
};

export default LandingPageNew;
