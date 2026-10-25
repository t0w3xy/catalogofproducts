import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from './db.js'

const PORT = process.env.PORT || 3001
const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const EMAIL_RE = /^\S+@\S+\.\S+$/

const app = express()
app.use(cors())
app.use(express.json())

// ---------- вспомогательные функции ----------

function sendError(res, status, error, fields) {
  res.status(status).json(fields ? { error, fields } : { error })
}

function validateCredentials(body) {
  const email = String(body?.email ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')
  const fields = {}

  if (!email) fields.email = 'Введите email'
  else if (!EMAIL_RE.test(email)) fields.email = 'Некорректный email'

  if (!password) fields.password = 'Введите пароль'
  else if (password.length < 6) fields.password = 'Пароль не короче 6 символов'

  return { email, password, fields }
}

function makeToken(user) {
  return jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' })
}

function publicUser(row) {
  return { id: row.id, email: row.email, role: row.role }
}

function findUserById(id) {
  return db
    .prepare(
      `SELECT u.id, u.email, r.name AS role
       FROM Users u JOIN Roles r ON r.id = u.role_id
       WHERE u.id = ?`
    )
    .get(id)
}

function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return sendError(res, 401, 'Требуется авторизация')

  try {
    const payload = jwt.verify(token, SECRET)
    const user = findUserById(payload.id)
    if (!user) return sendError(res, 401, 'Пользователь не найден')
    req.user = user
    next()
  } catch {
    sendError(res, 401, 'Сессия истекла, войдите заново')
  }
}

// ---------- авторизация ----------

app.post('/api/auth/register', (req, res) => {
  const { email, password, fields } = validateCredentials(req.body)
  if (Object.keys(fields).length) {
    return sendError(res, 400, 'Проверьте введённые данные', fields)
  }

  const exists = db.prepare('SELECT id FROM Users WHERE email = ?').get(email)
  if (exists) {
    return sendError(res, 409, 'Пользователь с таким email уже существует', {
      email: 'Этот email уже зарегистрирован',
    })
  }

  const roleId = db.prepare("SELECT id FROM Roles WHERE name = 'user'").get().id
  const hash = bcrypt.hashSync(password, 10)
  const info = db
    .prepare('INSERT INTO Users (email, password_hash, role_id) VALUES (?, ?, ?)')
    .run(email, hash, roleId)

  const user = findUserById(info.lastInsertRowid)
  res.status(201).json({ token: makeToken(user), user: publicUser(user) })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password, fields } = validateCredentials(req.body)
  if (Object.keys(fields).length) {
    return sendError(res, 400, 'Проверьте введённые данные', fields)
  }

  const row = db.prepare('SELECT id, password_hash FROM Users WHERE email = ?').get(email)
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return sendError(res, 401, 'Неверный email или пароль')
  }

  const user = findUserById(row.id)
  res.json({ token: makeToken(user), user: publicUser(user) })
})

app.get('/api/auth/me', auth, (req, res) => {
  res.json({ user: publicUser(req.user) })
})

// ---------- услуги ----------

app.get('/api/services', (req, res) => {
  const services = db
    .prepare('SELECT id, name, description, duration_min, price FROM Services ORDER BY id')
    .all()
  res.json(services)
})

// ---------- записи и оплата ----------

app.post('/api/orders', auth, (req, res) => {
  const { items, scheduledAt } = req.body ?? {}

  if (!Array.isArray(items) || items.length === 0) {
    return sendError(res, 400, 'Корзина пуста')
  }
  const date = new Date(scheduledAt)
  if (!scheduledAt || Number.isNaN(date.getTime())) {
    return sendError(res, 400, 'Укажите дату и время записи', { scheduledAt: 'Укажите дату и время' })
  }
  if (date.getTime() <= Date.now()) {
    return sendError(res, 400, 'Дата записи должна быть в будущем', { scheduledAt: 'Выберите будущую дату' })
  }

  const getService = db.prepare('SELECT id, price FROM Services WHERE id = ?')
  const rows = []
  for (const item of items) {
    const quantity = Number(item?.quantity)
    const service = getService.get(Number(item?.serviceId))
    if (!service) return sendError(res, 400, `Услуга ${item?.serviceId} не найдена`)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return sendError(res, 400, 'Количество должно быть от 1 до 20')
    }
    rows.push({ service, quantity })
  }

  const addAppointment = db.prepare(
    'INSERT INTO Appointments (user_id, service_id, quantity, scheduled_at) VALUES (?, ?, ?, ?)'
  )
  const addPayment = db.prepare(
    'INSERT INTO Payments (appointment_id, amount, method, status) VALUES (?, ?, ?, ?)'
  )

  // всё в одной транзакции: либо сохранится всё, либо ничего
  const create = db.transaction(() => {
    let total = 0
    const ids = []
    for (const { service, quantity } of rows) {
      const info = addAppointment.run(req.user.id, service.id, quantity, date.toISOString())
      const amount = service.price * quantity
      addPayment.run(info.lastInsertRowid, amount, 'card', 'paid')
      total += amount
      ids.push(Number(info.lastInsertRowid))
    }
    return { ids, total }
  })

  const result = create()
  res.status(201).json({ appointmentIds: result.ids, total: result.total })
})

app.get('/api/appointments', auth, (req, res) => {
  const list = db
    .prepare(
      `SELECT a.id, a.quantity, a.scheduled_at, a.status,
              s.name AS service_name, s.duration_min,
              p.amount, p.status AS payment_status
       FROM Appointments a
       JOIN Services s ON s.id = a.service_id
       LEFT JOIN Payments p ON p.appointment_id = a.id
       WHERE a.user_id = ?
       ORDER BY a.scheduled_at DESC`
    )
    .all(req.user.id)
  res.json(list)
})

// ---------- ошибки ----------

app.use('/api', (req, res) => sendError(res, 404, 'Маршрут не найден'))

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Некорректный JSON в запросе')
  }
  console.error(err)
  sendError(res, 500, 'Внутренняя ошибка сервера')
})

app.listen(PORT, () => {
  console.log(`API запущен: http://localhost:${PORT}`)
})
