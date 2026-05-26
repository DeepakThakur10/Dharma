import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import DashboardPreview from '../components/DashboardPreview';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <DashboardPreview />
      <Footer />
    </div>
  );
}

export default Home;