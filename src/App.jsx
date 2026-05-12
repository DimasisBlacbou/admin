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
  // ================= AUTH =================
  const [isAuth, setIsAuth] = useState(false);

  const [loginData, setLoginData] = useState({
    mail: "",
    password: "",
  });

  const [error, setError] = useState("");

  // Checks /auth — returns true if the current cookie belongs to an admin
  const checkAuth = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_MISERVER}/auth`,
        {
          credentials: "include",
        },
      );
      return response.ok; // 403 for non-admin, 401 for no token
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_MISERVER}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(loginData),
        },
      );

      if (!response.ok) {
        setError("Неправильный пароль или почта");
        return;
      }

      // Credentials are correct, but verify the account is an admin
      const isAdmin = await checkAuth();
      if (!isAdmin) {
        setError("Нет доступа. Требуются права администратора.");
        // Log out the cookie the server just set so it isn't reused
        await fetch(`${import.meta.env.VITE_API_MISERVER}/logout`, {
          method: "POST",
          credentials: "include",
        });
        return;
      }

      setIsAuth(true);
      setError("");
      fetchProducts();
    } catch (e) {
      console.error(e);
      setError("Ошибка сервера");
    }
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_MISERVER}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error(e);
    }

    setIsAuth(false);
    setProducts([]);
  };

  // ================= PRODUCTS =================
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

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_MISERVER}/products`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuth(false);
        }

        return;
      }

      const data = await response.json();

      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_MISERVER}/products?id=${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.ok) {
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formRef = useRef(null);
  const formRef1 = useRef(null);

  const addProduct = async () => {
    try {
      const formData = new FormData(formRef.current);

      formData.set("inStock", formData.get("inStock") === "on");

      const response = await fetch(
        `${import.meta.env.VITE_API_MISERVER}/products`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      if (response.ok) {
        fetchProducts();
        resetProduct();
        setaddModalIsOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addProduct1 = async () => {
    try {
      const formData = new FormData(formRef1.current);

      formData.set("inStock", product.inStock);
      formData.set("id", productID);

      const response = await fetch(
        `${import.meta.env.VITE_API_MISERVER}/productsChange`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      if (response.ok) {
        fetchProducts();
        setModalIsOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ================= MODALS =================
  const [addModalIsOpen, setaddModalIsOpen] = useState(false);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (product) => {
    setProductID(product.id);
    setProduct(product);
    setModalIsOpen(true);
  };

  // ================= INIT =================
  useEffect(() => {
    const init = async () => {
      const isAdmin = await checkAuth();
      if (isAdmin) {
        setIsAuth(true);
        fetchProducts();
      }
    };

    init();
  }, []);

  // ================= LOGIN SCREEN =================
  if (!isAuth) {
    return (
      <div className="container py-8">
        {error && <p style={{ color: "red" }}>{error}</p>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          style={{
            maxWidth: "400px",
            margin: "0 auto",
            padding: "20px",
            background: "#222",
            borderRadius: "10px",
          }}
        >
          <h2>Вход</h2>

          <input
            type="email"
            placeholder="Email"
            value={loginData.mail}
            onChange={(e) =>
              setLoginData({
                ...loginData,
                mail: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Пароль"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({
                ...loginData,
                password: e.target.value,
              })
            }
          />
          <br />

          <button type="submit">Войти</button>
        </form>
      </div>
    );
  }

  // ================= MAIN APP =================
  return (
    <>
      <button onClick={logout}>Выйти</button>

      <div className="products-list">
        {products.map((p) => (
          <div className="product-card" key={p.id}>
            <img
              className="product-image"
              src={`${import.meta.env.VITE_API_MISERVER}/${p.image}`}
              alt={p.name}
            />

            <div>{p.name}</div>

            <div>{p.price} ₽</div>

            <div>Вес: {p.weight}</div>

            <div>Вкус: {p.flavor}</div>

            <div>{p.description}</div>

            <span>{p.inStock ? "В наличии" : "Нет в наличии"}</span>

            <button onClick={() => openModal(p)}>изменить</button>

            <button onClick={() => deleteProduct(p.id)}>удалить</button>
          </div>
        ))}
      </div>

      <button onClick={() => setaddModalIsOpen(true)}>Добавить товар</button>

      {/* ADD MODAL */}
      <Modal isOpen={addModalIsOpen} style={customStyles}>
        <form ref={formRef} className="form-add-product">
          <h1>Добавление</h1>

          <input name="name" placeholder="Название" />

          <input name="price" type="number" placeholder="Цена" />

          <input name="description" placeholder="Описание" />

          <input name="weight" placeholder="Вес" />

          <input name="flavor" placeholder="Вкус" />

          <input type="file" name="image" />

          <label>
            <input type="checkbox" name="inStock" />В наличии
          </label>

          <button type="button" onClick={addProduct}>
            Добавить
          </button>

          <button type="button" onClick={() => setaddModalIsOpen(false)}>
            Закрыть
          </button>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={modalIsOpen} style={customStyles}>
        <form ref={formRef1} className="form-add-product">
          <h1>Изменение</h1>

          <input
            name="name"
            value={product.name}
            onChange={(e) =>
              setProduct({
                ...product,
                name: e.target.value,
              })
            }
          />

          <input
            name="price"
            type="number"
            value={product.price}
            onChange={(e) =>
              setProduct({
                ...product,
                price: e.target.value,
              })
            }
          />

          <input
            name="description"
            value={product.description}
            onChange={(e) =>
              setProduct({
                ...product,
                description: e.target.value,
              })
            }
          />

          <input
            name="weight"
            value={product.weight}
            onChange={(e) =>
              setProduct({
                ...product,
                weight: e.target.value,
              })
            }
          />

          <input
            name="flavor"
            value={product.flavor}
            onChange={(e) =>
              setProduct({
                ...product,
                flavor: e.target.value,
              })
            }
          />

          <input type="file" name="image" />

          <label>
            <input
              type="checkbox"
              checked={product.inStock}
              onChange={(e) =>
                setProduct({
                  ...product,
                  inStock: e.target.checked,
                })
              }
            />
            В наличии
          </label>

          <button type="button" onClick={addProduct1}>
            сохранить
          </button>

          <button type="button" onClick={() => setModalIsOpen(false)}>
            Закрыть
          </button>
        </form>
      </Modal>
    </>
  );
}

export default App;
