type Props = {
  setView: (view: 'store' | 'checkout' | 'admin') => void
}

export default function Header({ setView }: Props) {
  return (
    <header>
      <button onClick={() => setView('store')}>المتجر</button>
      <button onClick={() => setView('checkout')}>الدفع</button>
      <button onClick={() => setView('admin')}>لوحة التحكم</button>
    </header>
  )
}
