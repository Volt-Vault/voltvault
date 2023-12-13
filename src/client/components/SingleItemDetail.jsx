import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API = 'http://localhost:3000/api';

function ItemDetails({ token, cart, setCart }) {
  const [item, setItem] = useState(null);
  const [buttonColor, setButtonColor] = useState('btn-outline-success');
  const { itemid } = useParams();
  const isInCart = cart.items && cart.items.some(item => item.id === parseInt(itemid));

  useEffect(() => {
    fetchSingleItemDetail();
  }, [itemid, cart]);

  async function fetchSingleItemDetail() {
    try {
      const response = await axios.get(`${API}/items/${itemid}`);
      setItem(response.data);
    } catch (err) {
      console.error(err);
      setItem(null);
    }
  }

  async function handleAddToCart() {
    try {
      if (cart.id) {
        if (!isInCart) {
          await addItemToCart(cart);
        } else {
          await removeItemFromCart();
        }
      } else {
        await createNewCart();
      }
      setButtonColor('btn-danger'); 
    } catch (error) {
      console.error('Error in handleAddToCart function', error);
    }
  }

  async function createNewCart() {
    try {
      const response = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isOpen: true,
        }),
      });
      const json = await response.json();
      if (json.id) {
        addItemToCart(json);
        setCart(json);
      } else {
        console.error('Error in POST new cart');
      }
    } catch (error) {
      console.error('Error in creating a new cart', error);
    }
  }

  async function addItemToCart(cart) {
    try {
      const response = await fetch(`${API}/orders/${cart.id}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_id: itemid,
          quantity: 1,
        }),
      });
      const json = await response.json();
      
    } catch (error) {
      console.error('ERROR ', error);
    }
  }

  async function removeItemFromCart() {
    try {
      const itemInCart = cart.items.find(item => item.id === parseInt(itemid));
      if (itemInCart) {
        const response = await fetch(`${API}/orders/${cart.id}/items/${itemInCart.orderItemsId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await response.json();
       
      }
    } catch (error) {
      console.error('ERROR ', error);
    }
  }

  return (
    <div id="singleItem" className="card mb-3 w-75 mb-3 shadow p-3 mb-5 bg-body-tertiary rounded singleItemDetail">
      <div className="row g-0">
        <div className="col-md-4">
          {item && item.img && (
            <img src={`${item.img}`} className="img-fluid rounded-start" alt={`Image of ${item.name}`} />
          )}
        </div>
        <div className="col-md-8">
          <div className="card-body">
            <h2 className="card-title pb-2">{item?.name} details</h2>
            <p>{item?.details}</p>
            <p className="card-text">
              <small className="text-body-secondary">Stock: {item?.stock}</small>
            </p>
            <p className="card-text">
              <small className="text-body-secondary"> Price: ${item?.price}</small>
            </p>
            <br />
            {token && (
              <button
                type="button"
                className={`btn ${buttonColor}`}
                onClick={() => handleAddToCart()}
              >
                {isInCart ? 'Item already in Cart' : 'Add item to Cart'}
              </button>
            )}
            {!token && (
              <p style={{ color: 'red', fontWeight: 'bold' }}>
                Please log in to add items to your cart.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetails;