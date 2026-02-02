import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from '../sections/Footer/Footer';
import Contacto from '../sections/Contacto/Contacto';
import ScrollToTop from '../ui/ScrollToTop';
import FediWidget from '../ui/FediWidget/FediWidget';

export default function MainLayout() {
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
