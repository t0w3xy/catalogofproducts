import { useParams, useNavigate } from 'react-router-dom'
import { products } from '../data/products'
import { useCart } from '../context/CartContext'

function Product() {
  const { id } = useParams()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const product = products.find((p) => p.id === Number(id))

  if (!product) return <h1>Товар не найден</h1>

  return (
    <div className="card">
      <h1>Товар с id: {product.id}</h1>
      <h2>{product.name}</h2>
      <p>Цена: {product.price.toLocaleString('ru-RU')} ₽</p>
      <button
        onClick={() => {
          addItem(product)
          navigate('/cart')
        }}
      >
        В корзину и перейти к оформлению
      </button>
    </div>
  )
}

export default Product
