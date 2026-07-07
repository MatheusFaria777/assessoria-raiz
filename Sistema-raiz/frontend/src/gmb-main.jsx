import { createRoot } from 'react-dom/client'
import './index.css'
import GmbForm from './pages/GmbForm'

const slug = new URLSearchParams(window.location.search).get('c')
createRoot(document.getElementById('root')).render(<GmbForm slug={slug} />)
