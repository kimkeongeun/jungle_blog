import logo from './logo.svg';
import './App.css';
import Example01 from './EXample01';
import Main_login from './main_login';
import Main from './Main';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main_login />} />
        <Route path="/signup" element={<Example01 />} />
        <Route path="/main" element={<Main />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
