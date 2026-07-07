import { createRoot } from 'react-dom/client'
import './index.css'
import FeedbackPublic from './pages/FeedbackPublic'

const slug = new URLSearchParams(window.location.search).get('c')
createRoot(document.getElementById('root')).render(<FeedbackPublic slug={slug} />)
