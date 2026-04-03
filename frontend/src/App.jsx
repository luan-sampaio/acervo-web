import { Route, Routes } from 'react-router-dom'
import BookList from './pages/BookList'
import NewBook from './pages/NewBook'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BookList />} />
      <Route path="/new" element={<NewBook />} />
    </Routes>
  )
}
