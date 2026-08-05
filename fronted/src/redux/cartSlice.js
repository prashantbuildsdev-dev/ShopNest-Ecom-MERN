import { createSlice } from "@reduxjs/toolkit";

const getSavedCartItems = () => {
    try {
        const savedCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
        if (!Array.isArray(savedCart)) return [];

        // Accept carts saved by earlier versions, then keep one consistent shape.
        return savedCart
            .map((item) => ({
                ...item,
                productId: item.productId || item._id,
                qty: Number(item.qty || item.quantity || 1),
            }))
            .filter((item) => item.productId && Number.isFinite(item.qty) && item.qty > 0);
    } catch {
        return [];
    }
};

const persistCartItems = (cartItems) => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
};

const initialState = {
    cartItems: getSavedCartItems(),
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) =>{
            const item = {
                ...action.payload,
                productId: action.payload.productId || action.payload._id,
            };
            if (!item.productId) return;

            const existingItem = state.cartItems.find((x) => x.productId === item.productId);
            if(existingItem){
                existingItem.qty += Number(item.qty) || 1;
            } else {
                state.cartItems.push({...item, qty: Number(item.qty) || 1});
            }
            persistCartItems(state.cartItems);
        },
        setCartItemQuantity: (state, action) => {
            const { productId, qty } = action.payload;
            const item = state.cartItems.find((cartItem) => cartItem.productId === productId);
            if (!item) return;

            if (qty <= 0) {
                state.cartItems = state.cartItems.filter((cartItem) => cartItem.productId !== productId);
            } else {
                item.qty = qty;
            }
            persistCartItems(state.cartItems);
        },
        removeFromCart: (state, action) => {
            const itemId = action.payload;
            state.cartItems = state.cartItems.filter((x) => x.productId !== itemId);
            persistCartItems(state.cartItems);
        },
        clearCart: (state) => {
            state.cartItems = [];
            localStorage.removeItem('cartItems');
        },
    },
});

export const {addToCart, setCartItemQuantity, removeFromCart, clearCart} = cartSlice.actions;
export default cartSlice.reducer;
