import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import LandingPage from '../pages/LandingPage/LandingPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}