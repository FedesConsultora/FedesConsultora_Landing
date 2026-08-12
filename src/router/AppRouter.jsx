import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import LandingPage from '../pages/LandingPage/LandingPage'
import BlogPostDetail from '../pages/BlogPostDetail/BlogPostDetail'
import Consultora from '../components/sections/Consultora/Consultora'
import Agencia from '../components/sections/Agencia/Agencia'
import Nosotros from '../components/sections/Nosotros/Nosotros'
import Blog from '../components/sections/Blog/Blog'
import Galeria from '../components/sections/Galeria/Galeria'
import Contacto from '../components/sections/Contacto/Contacto'
import OdooLanding from '../pages/OdooLanding/OdooLanding'
import OnboardingEmpresas from '../pages/Onboarding/OnboardingEmpresas'
import FerdersCard from '../pages/FerdersCard/FerdersCard'
import BonoLanding from '../pages/BonoLanding/BonoLanding'
import TerminosCondiciones from '../pages/Legal/TerminosCondiciones'
import Privacidad from '../pages/Legal/Privacidad'
import AdminDashboard from '../pages/Admin/AdminDashboard'

function LegacyGaliciaRedirect() {
  const location = useLocation()
  return <Navigate to={`/regalo-galicia${location.search}${location.hash}`} replace />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/blog/:id" element={<BlogPostDetail />} />
          <Route path="/consultora" element={<Consultora />} />
          <Route path="/agencia" element={<Agencia />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/hablemos" element={<LandingPage />} />
          <Route path="/terminos-y-condiciones" element={<TerminosCondiciones />} />
          <Route path="/privacidad" element={<Privacidad />} />
        </Route>
        {/* Standalone Landing Pages */}
        <Route path="/regalo-galicia" element={<BonoLanding />} />
        <Route path="/bono" element={<LegacyGaliciaRedirect />} />
        <Route path="/odoo" element={<OdooLanding />} />
        <Route path="/onboarding-empresas" element={<OnboardingEmpresas />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/ferders/cards/:slug" element={<FerdersCard />} />
        <Route path="/feders/cards/:slug" element={<FerdersCard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
