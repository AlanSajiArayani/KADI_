import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ bakeryId: null, bakeryName: null, items: [] });

  const addToCart = (bakeryId, bakeryName, snack, quantity) => {
    setCart((prev) => {
      if (prev.bakeryId && prev.bakeryId !== bakeryId) {
        if (!window.confirm('You can only order from one bakery at a time. Clear current cart to start a new order?')) {
          return prev;
        }
        return { bakeryId, bakeryName, items: [{ ...snack, quantity }] };
      }

      const existingItem = prev.items.find(item => item._id === snack._id);
      let newItems;
      if (existingItem) {
        newItems = prev.items.map(item => 
          item._id === snack._id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newItems = [...prev.items, { ...snack, quantity }];
      }

      return { bakeryId, bakeryName, items: newItems };
    });
  };

  const updateQuantity = (snackId, quantity) => {
    setCart(prev => {
      const newItems = prev.items.map(item => 
        item._id === snackId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0);
      
      if (newItems.length === 0) return { bakeryId: null, bakeryName: null, items: [] };
      return { ...prev, items: newItems };
    });
  };

  const clearCart = () => setCart({ bakeryId: null, bakeryName: null, items: [] });
  const removeFromCart = (snackId) => updateQuantity(snackId, 0);

  const cartTotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
