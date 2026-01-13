import { Outlet } from 'react-router-dom'
import Header from './Header'
import Hero from '../sections/Hero/Hero'
import Footer from '../sections/Footer/Footer'

export default function MainLayout() {
  return (
    <>
      <Header />
      <Hero />
      <Outlet />
      <Footer />
    </>
  )
}
