import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;

}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);



export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const responseStock = await api.get(`stock/${productId}`);
      const productStock = responseStock.data;
      const isVoidCart = cart.find(product => product.id === productId)

      if (isVoidCart) {

        if (productStock.amount > isVoidCart.amount) {

          const CartExists = cart.map(product => product.id === productId ? {
            ...product,
            amount: product.amount + 1
          } : product


          );


          setCart(CartExists);

          localStorage.setItem('@RocketShoes:cart', JSON.stringify(CartExists));


        } else {

          toast.error('Quantidade solicitada fora de estoque');

        }

      } else {

        const response = await api.get(`products/${productId}`);
        const Cartnew = response.data;

        const newCarts = [...cart, {
          id: Cartnew.id,
          title: Cartnew.title,
          price: Cartnew.price,
          image: Cartnew.image,
          amount: 1,
        }]
        setCart(newCarts);

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCarts));
      }



    } catch {

      toast.error('Erro na adição do produto');
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {

      const CartExi = cart.filter(product => product.id === productId)

      if (CartExi.length === 0) {
        toast.error('Erro na remoção do produto');

      } else {

        const newCart = cart.filter(product => product.id !== productId)


        setCart(newCart);

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));

      }


      // TODO
    } catch {

      toast.error('Erro na remoção do produto');
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {


    try {


      if (amount < 1) {
        return;

      } else {

        console.log(productId)
        const response = await api.get(`stock/${productId}`);


        const productStock = response.data;
        console.log(productStock);
        /*if (isIncrement) {*/


        if (productStock.amount >= amount) {

          const productIncrement = cart.map(product => product.id === productId ? {
            ...product,
            amount: amount
          } : product

          );

          setCart(productIncrement);

          localStorage.setItem('@RocketShoes:cart', JSON.stringify(productIncrement));
        } else {

          toast.error('Quantidade solicitada fora de estoque');
          return
        }
      }



      // TODO
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
