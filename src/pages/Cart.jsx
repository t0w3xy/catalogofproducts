import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Cart() {
  const { items, total, removeItem, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div>
        <h1>Корзина</h1>
        <p>Корзина пуста. <Link to="/catalog">Перейти в каталог</Link></p>
      </div>
    )
  }

  return (
    <div>
      <h1>Корзина</h1>

      {items.map((item) => (
        <div className="row" key={item.id}>
          <span>
            {item.name} {item.qty > 1 && `× ${item.qty}`}
          </span>
          <span>{(item.price * item.qty).toLocaleString('ru-RU')} ₽</span>
          <button onClick={() => removeItem(item.id)}>Удалить</button>
        </div>
      ))}

      <h2>Итого: {total.toLocaleString('ru-RU')} ₽</h2>
      <button onClick={clearCart}>Очистить корзину</button>
    </div>
  )
}

export default Cart
