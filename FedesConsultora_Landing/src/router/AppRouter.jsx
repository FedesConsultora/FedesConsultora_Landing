import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import LandingPage from '../pages/LandingPage/LandingPage'
import BlogPostDetail from '../pages/BlogPostDetail/BlogPostDetail'
import Consultora from '../components/sections/Consultora/Consultora'
import Agencia from '../components/sections/Agencia/Agencia'
import Nosotros from '../components/sections/Nosotros/Nosotros'
import Blog from '../components/sections/Blog/Blog'
import Galeria from '../components/sections/Galeria/Galeria'
import Contacto from '../components/sections/Contacto/Contacto'

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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}