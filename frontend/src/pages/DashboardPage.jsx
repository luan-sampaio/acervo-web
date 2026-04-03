import { useNavigate } from 'react-router-dom'
import DashboardOverview from '../components/DashboardOverview'

const emptyMetrics = {
  favoriteCount: 0,
  readingNowCount: 0,
  finishedCount: 0,
  wantToReadCount: 0,
}

export default function DashboardPage() {
  const navigate = useNavigate()

  return (
    <DashboardOverview
      metrics={emptyMetrics}
      recentBooks={[]}
      onOpenCollection={() => navigate('/collection')}
    />
  )
}
