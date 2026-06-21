import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60000, refetchOnWindowFocus: false } }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="top-center" toastOptions={{
          style: { fontFamily: 'Vazirmatn', direction: 'rtl', fontSize: '13px' },
          success: { style: { background: '#0e7f5c', color: '#fff' } },
          error: { style: { background: '#dc2626', color: '#fff' } },
        }}/>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
