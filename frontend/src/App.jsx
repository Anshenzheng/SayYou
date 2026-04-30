import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import UserPage from './pages/UserPage'
import ScreenPage from './pages/ScreenPage'
import StatsPage from './pages/StatsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/user/:roomId" element={<UserPage />} />
        <Route path="/screen/:roomId" element={<ScreenPage />} />
        <Route path="/stats/:roomId" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
