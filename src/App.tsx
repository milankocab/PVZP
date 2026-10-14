import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CaseStudyPage } from './pages/CaseStudyPage'
import { PurchasePage } from './pages/PurchasePage'
import { ResultsPage } from './pages/ResultsPage'

export default function App() {
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
