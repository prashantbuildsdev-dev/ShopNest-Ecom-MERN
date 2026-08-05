import React,{useEffect, useState} from "react";
import ProductCard from '../components/ProductCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const Home = () =>{
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

    useEffect(() =>{
      const fetchProducts = async () =>{
        try{
          const res = await fetch(`${API_BASE_URL}/api/product`);
          if (!res.ok) {
            throw new Error(`Could not load products (${res.status})`);
          }
          const data = await res.json();
          setProducts(Array.isArray(data) ? data.slice(0, 4) : []);
        } catch (error){
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }, []);

  return (
    <div className="home-container">
      <div className="hero-banner">
        <h1>Welcome to ShopNest</h1>
        <p>Discover the best products at unbeatable prices.</p>
      </div>
      <h2>Featured Products</h2>
      {loading ?(
        <div>Loading...</div>
      ):(
        <div className="product-grid">
          {products.map((product) =>(
            <ProductCard key={product._id} product={product}/>
          ))}
          </div>
      )}
    </div>
  );
};

export default Home;
