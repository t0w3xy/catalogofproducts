import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { products } from '../data/products'
import { useCart } from '../context/CartContext'

function Catalog() {
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [addedName, setAddedName] = useState(null)

  function handleAdd(product) {
    addItem(product)
    setAddedName(product.name)
  }

  return (
    <div>
      <h1>Каталог товаров</h1>

      {addedName && (
        <div className="notice">
          <span>«{addedName}» добавлен в корзину</span>
          {/* программный переход */}
          <button onClick={() => navigate('/cart')}>Перейти в корзину</button>
        </div>
      )}

      {products.map((p) => (
        <div className="row" key={p.id}>
          <div>
            <Link to={`/product/${p.id}`}>{p.name}</Link>
            <div>{p.price.toLocaleString('ru-RU')} ₽</div>
          </div>
          <button onClick={() => handleAdd(p)}>В корзину</button>
        </div>
      ))}
    </div>
  )
}

export default Catalog
