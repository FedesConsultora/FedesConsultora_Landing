import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from '../sections/Footer/Footer';
import Contacto from '../sections/Contacto/Contacto';
import ScrollToTop from '../ui/ScrollToTop';
import FediWidget from '../ui/FediWidget/FediWidget';
import useMediaPreloader from '../../hooks/useMediaPreloader';

export default function MainLayout() {
  // Start preloading gallery assets as soon as the layout mounts
  useMediaPreloader();

  return (
    <>
      <ScrollToTop />
      <Header />
      <Outlet />
      <Contacto />
      <Footer />
      <FediWidget />
    </>
  );
}
