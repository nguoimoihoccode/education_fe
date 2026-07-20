import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LearningPreview from './components/LearningPreview';
import StartSection from './components/StartSection';
import FeaturesGrid from './components/FeaturesGrid';
import Stats from './components/Stats';
import Testimonials from './components/Testimonials';
import CtaFooter from './components/CtaFooter';
import './Landing.css';

const FeaturesChess = lazy(() => import('./components/FeaturesChess'));

const LandingPageNew = () => {
  return (
    <div className="landing-page-root min-h-screen">
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <LearningPreview />
        <div>
          <StartSection />
          <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
            <FeaturesChess />
          </Suspense>
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
