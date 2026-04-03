import { useNavigate } from 'react-router-dom'
import HomeOverview from '../components/HomeOverview'

export default function HomePage() {
  const navigate = useNavigate()

  return <HomeOverview onOpenCollection={() => navigate('/collection')} />
}
