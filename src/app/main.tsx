import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App'
import './styles/index.css'

const root = document.getElementById('root')!
const app = (
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
)

// Гидрируем только разметку, пререндеренную ровно для этого адреса. Всё
// остальное (админка, неизвестный путь, `index.html` не своего маршрута)
// рендерится с нуля — иначе React получил бы чужой DOM и ругался на расхождения.
if (root.hasChildNodes() && root.dataset.route === location.pathname) {
    hydrateRoot(root, app)
} else {
    root.replaceChildren()
    createRoot(root).render(app)
}
