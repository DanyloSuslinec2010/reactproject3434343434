import { useState } from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';



function App() {
  const [searchMessage, setSearchMessage] = useState('');

  const handleSearch = (city) => {
    setSearchMessage(`Город для поиска: ${city}`);
  };

  return (
    <>
      <Header />
      <Hero onSearch={handleSearch} />
      {searchMessage && <p role="status">{searchMessage}</p>}
    </>
  );
}



export default App;
