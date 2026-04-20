import { useEffect, useState, useRef } from "react";
import Modal from "react-modal";
import "./App.css";
Modal.setAppElement("#root");
const customStyles = {
  content: {
    background: "none",
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};
function App() {
  const [productID, setProductID] = useState(0);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState({
    name: "",
    price: 0,
    weight: 0,
    description: "",
    flavor: "",
    image: "",
    inStock: false,
  });
  const resetProduct = () => {
    setProduct({
      name: "",
      price: 0,
      weight: 0,
      description: "",
      flavor: "",
      image: "",
      inStock: false,
    });
  };
  const [addModalIsOpen, setaddModalIsOpen] = useState(false);
  function addOpenModal() {
    setaddModalIsOpen(true);
  }

  function addCloseModal() {
    setaddModalIsOpen(false);
  }
  const [modalIsOpen, setModalIsOpen] = useState(false);
  function openModal(product) {
    setProductID(product.id);
    setProduct(product);
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  const fetchProducts = () => {
    fetch("https://miserver-th4q.onrender.com/products", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => setProducts(data));
  };
  useEffect(() => {
    fetchProducts();
  }, []);
  const deleteProduct = (id) => {
    fetch(`https://miserver-th4q.onrender.com/products?id=${id}`, {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
        fetchProducts();
      } else {
        console.error("Failed to delete product");
      }
    });
  };

  const formRef = useRef(null);
  const formRef1 = useRef(null);

  const addProduct = () => {
    const formData = new FormData(formRef.current);
    formData.set("inStock", formData.get("inStock") == "on");

    fetch(`${import.meta.env.VITE_API_MISERVER}/products`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((_) => fetchProducts());
  };
  const addProduct1 = () => {
    const formData = new FormData(formRef1.current);
    formData.set("inStock", product.inStock);
    formData.set("id", productID);

    fetch(`${import.meta.env.VITE_API_MISERVER}/productsChange`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((_) => fetchProducts());
  };
  return (
    <>
      <div className="products-list">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <img
              className="product-image"
              src={`${import.meta.env.VITE_API_MISERVER}/${product.image}`}
              alt={product.name}
            />
            <div className="product-title">{product.name}</div>
            <div className="product-price">{product.price} ₽</div>
            <div className="product-info">Вес: {product.weight}</div>
            <div className="product-info">Вкус: {product.flavor}</div>
            <div className="product-description">{product.description}</div>
            <span className="product-badge">
              {product.inStock === "true" ? "В наличии" : "Нет в наличии"}
            </span>
            <button onClick={() => openModal(product)}>изменить товар</button>
            <button onClick={() => deleteProduct(product.id)}>
              Удалить товар
            </button>
          </div>
        ))}
      </div>
      <Modal
        isOpen={addModalIsOpen}
        onRequestClose={addCloseModal}
        style={customStyles}
      >
        <form
          className="form-add-product"
          action=""
          encType="multipart/form-data"
          ref={formRef}
        >
          <h1>Форма добавления</h1>
          <input
            type="text"
            placeholder="Название"
            name="name"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Цена"
            name="price"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
          />
          <input
            type="text"
            placeholder="Описание"
            name="description"
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Вес"
            name="weight"
            value={product.weight}
            onChange={(e) => setProduct({ ...product, weight: e.target.value })}
          />
          <input
            type="text"
            placeholder="Вкус"
            name="flavor"
            value={product.flavor}
            onChange={(e) => setProduct({ ...product, flavor: e.target.value })}
          />
          <input
            type="file"
            placeholder="Изображение"
            name="image"
            onChange={(e) => setProduct({ ...product, image: e.target.value })}
          />
          <label>
            <input
              type="checkbox"
              placeholder="Наличие"
              name="inStock"
              checked={JSON.parse(product.inStock)}
              onChange={(e) =>
                setProduct({ ...product, inStock: e.target.checked })
              }
            />
            В наличии
          </label>
          <button type="button" onClick={() => addProduct()}>
            Добавить товар
          </button>
          <input type="reset" value={"Очистить"} onClick={resetProduct}></input>
        </form>
      </Modal>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        np
      >
        <form
          className="form-add-product"
          action=""
          encType="multipart/form-data"
          ref={formRef1}
        >
          <h1>Форма изменения</h1>
          <input
            type="text"
            name="name"
            placeholder="Название"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
          />
          <input
            name="price"
            type="number"
            placeholder="Цена"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
          />
          <input
            type="text"
            name="description"
            placeholder="Описание"
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
          />
          <input
            type="text"
            name="weight"
            placeholder="Вес"
            value={product.weight}
            onChange={(e) => setProduct({ ...product, weight: e.target.value })}
          />
          <input
            type="text"
            placeholder="Вкус"
            name="flavor"
            value={product.flavor}
            onChange={(e) => setProduct({ ...product, flavor: e.target.value })}
          />
          <input
            type="file"
            name="image"
            placeholder="Изображение"
            onChange={(e) => setProduct({ ...product, image: e.target.value })}
          />
          <label>
            <input
              type="checkbox"
              placeholder="Наличие"
              checked={JSON.parse(product.inStock)}
              onChange={(e) =>
                setProduct({ ...product, inStock: e.target.checked })
              }
            />
            В наличии
          </label>
          <button type="button" onClick={() => addProduct1()}>
            изменить
          </button>
          <input type="reset" value={"Очистить"} onClick={resetProduct}></input>
        </form>
      </Modal>
      <button onClick={addOpenModal}>Добавить товар</button>
    </>
  );
}

export default App;
