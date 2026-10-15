import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { initPostHog, trackPageview } from './analytics/track'
import { Layout } from './components/Layout'
import { CaseStudyPage } from './pages/CaseStudyPage'
import { PurchasePage } from './pages/PurchasePage'
import { ResultsPage } from './pages/ResultsPage'

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => initPostHog(), [])
  useEffect(() => trackPageview(), [pathname])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CaseStudyPage />} />
        <Route path="/sjednani" element={<PurchasePage />} />
        <Route path="/vysledky" element={<ResultsPage />} />
        <Route path="*" element={<CaseStudyPage />} />
      </Routes>
    </Layout>
  )
}
