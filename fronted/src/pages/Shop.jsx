import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/product`);
        if (!response.ok) {
          throw new Error(`Could not load products (${response.status})`);
        }

        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (requestError) {
        console.error(requestError);
        setError('Products could not be loaded. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="home-container">
      <h1>Shop</h1>
      {loading && <p>Loading products...</p>}
      {error && <p className="page-message">{error}</p>}
      {!loading && !error && (
        <div className="product-grid">
          {products.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      )}
    </div>
  );
}

export default Shop;
