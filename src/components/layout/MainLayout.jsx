import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from '../sections/Footer/Footer';
import Contacto from '../sections/Contacto/Contacto';
import ScrollToTop from '../ui/ScrollToTop';
import FediWidget from '../ui/FediWidget/FediWidget';
import useMediaPreloader from '../../hooks/useMediaPreloader';

export default function MainLayout() {
  useMediaPreloader();

  return (
    <div className="site-layout">
      <ScrollToTop />
      <Header />
      <Outlet />
      <Contacto />
      <Footer />
      <FediWidget />
    </div>
  );
}
