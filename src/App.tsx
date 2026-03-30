import { Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { ContactsPage } from './pages/ContactsPage'
import { PropertiesPage } from './pages/PropertiesPage'
import { DealsPage } from './pages/DealsPage'
import MatchingPage from './pages/MatchingPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="deals" element={<DealsPage />} />
        <Route path="matching" element={<MatchingPage />} />
      </Route>
    </Routes>
  )
}
