import React from "react";
import { useLocation } from "react-router-dom";
import { Header } from "../../layouts/header/header";
import { Footer } from "../../layouts/footer/footer";

const ProductItem = () => {
  const location = useLocation();
  const { response: productItems } = location.state || {};

  if (!productItems || productItems.length === 0) {
    return <div>No products found</div>;
  }

  return (
    <>
      <Header />
      <div style={{ padding: "20px" }}>
        <h1>Product Items</h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          {productItems.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                textAlign: "center",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                style={{ width: "100%", height: "150px", objectFit: "cover" }}
              />
              <h3>{item.name}</h3>
              <p>Price: {item.price} VND</p>
              <p>Age: {item.age} years</p>
              <p>Size: {item.size}</p>
              <button
                style={{
                  padding: "10px",
                  backgroundColor: "#C70025",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductItem;
