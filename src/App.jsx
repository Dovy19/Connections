import './App.css'
import { useState } from 'react'
import BoxItemGrid from './BoxItemGrid'
import Rules from './Rules'
import Header from './Header'

function App() {

const [showRules, setShowRules] = useState(true);

const handleCloseRules = () => {
  setShowRules(false);
}
  return (
    <>
      <Header />
      {showRules && <Rules onClose={handleCloseRules} />}
      <BoxItemGrid />
    </>
  )
}

export default App
