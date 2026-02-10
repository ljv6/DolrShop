import { useState } from 'react'
import Header from './components/Header'
import ProductCard from './components/ProductCard'
import Cart from './components/Cart'
import CheckoutPage from './components/CheckoutPage'
import AdminPanel from './components/AdminPanel'

function App() {
  const [view, setView] = useState<'store' | 'checkout' | 'admin'>('store')

  return (
    <div>
      <Header setView={setView} />
      {view === 'store' && <ProductCard />}
      {view === 'checkout' && <CheckoutPage />}
      {view === 'admin' && <AdminPanel />}
      <Cart />
    </div>
  )
}

export default App
