import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import 'bootstrap/dist/css/bootstrap.min.css';;
import './index.css';
import App from './App.jsx';
import ProductDetail from './ProductDetail.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/products/:id" element={<ProductDetail />} />
    </Routes>
  </BrowserRouter>,
)
