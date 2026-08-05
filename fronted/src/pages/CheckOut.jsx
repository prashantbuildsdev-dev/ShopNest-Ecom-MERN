import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ fullName: '', street: '', city: '', postalCode: '', country: '' });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const saveOrder = async (paymentId, method) => {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({
        items: cartItems.map((item) => ({ ProductId: item.productId, quantity: item.qty, price: item.price })),
        totalAmount: totalPrice,
        address,
        paymentId,
        paymentMethod: method
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Order saving failed');
    }

    dispatch(clearCart());
    navigate('/ordersuccess');
  };

  const handleRazorpayPayment = async () => {
    const orderResponse = await fetch(`${API_BASE_URL}/api/payment/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ amount: totalPrice })
    });
    const orderData = await orderResponse.json();
    if (!orderResponse.ok) throw new Error(orderData.message || 'Payment could not be initialized.');
    if (!window.Razorpay) throw new Error('The Razorpay checkout script could not be loaded.');

    const checkout = new window.Razorpay({
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'ShopNest',
      description: 'ShopNest order payment',
      order_id: orderData.id,
      handler: async (paymentResponse) => {
        try {
          const verifyResponse = await fetch(`${API_BASE_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
            body: JSON.stringify(paymentResponse)
          });
          if (!verifyResponse.ok) {
            const data = await verifyResponse.json().catch(() => ({}));
            throw new Error(data.message || 'Payment verification failed');
          }
          await saveOrder(paymentResponse.razorpay_payment_id, 'razorpay');
        } catch (error) {
          alert(error.message || 'Payment verification failed.');
        } finally {
          setIsSubmitting(false);
        }
      },
      modal: { ondismiss: () => setIsSubmitting(false) },
      prefill: { name: address.fullName, email: user?.email, contact: '9999999999' },
      theme: { color: '#f97316' }
    });
    checkout.open();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) { alert('Please login first'); navigate('/login'); return; }
    if (cartItems.length === 0) { alert('Your cart is empty.'); navigate('/cart'); return; }

    setIsSubmitting(true);
    try {
      if (paymentMethod === 'cod') {
        await saveOrder(undefined, 'cod');
      } else {
        await handleRazorpayPayment();
      }
    } catch (error) {
      alert(error.message || 'Could not place your order.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>Shipping Address</h3>
          <input type="text" placeholder="Full Name" required value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
          <input type="text" placeholder="Street" required value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
          <input type="text" placeholder="City" required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
          <input type="text" placeholder="Postal Code" required value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
          <input type="text" placeholder="Country" required value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
          <fieldset style={{ border: 0, padding: 0, margin: '16px 0' }}>
            <legend style={{ marginBottom: 8 }}>Payment method</legend>
            <label style={{ display: 'block', marginBottom: 8 }}>
              <input type="radio" name="paymentMethod" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} /> Pay online with Razorpay
            </label>
            <label style={{ display: 'block' }}>
              <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} /> Cash on Delivery
            </label>
          </fieldset>
          <div className="checkout-summary">
            <h4>Total to Pay: ₹{totalPrice.toFixed(2)}</h4>
            <button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : paymentMethod === 'cod' ? 'Place COD Order' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
