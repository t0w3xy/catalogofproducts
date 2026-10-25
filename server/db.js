import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))

const db = new Database(path.join(dir, 'shop.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// создаём таблицы
db.exec(fs.readFileSync(path.join(dir, 'schema.sql'), 'utf8'))

// начальные данные
if (db.prepare('SELECT COUNT(*) AS c FROM Roles').get().c === 0) {
  const addRole = db.prepare('INSERT INTO Roles (name) VALUES (?)')
  addRole.run('user')
  addRole.run('admin')
}

if (db.prepare('SELECT COUNT(*) AS c FROM Services').get().c === 0) {
  const addService = db.prepare(
    'INSERT INTO Services (name, description, duration_min, price) VALUES (?, ?, ?, ?)'
  )
  const services = [
    ['Мужская стрижка', 'Стрижка машинкой и ножницами с укладкой', 45, 1200],
    ['Окрашивание волос', 'Окрашивание в один тон с уходом после процедуры', 120, 4500],
    ['Маникюр', 'Классический маникюр с покрытием гель-лаком', 60, 1800],
    ['Массаж спины', 'Расслабляющий массаж спины и шеи', 60, 2500],
    ['Чистка лица', 'Ультразвуковая чистка с увлажняющей маской', 50, 2200],
    ['Консультация косметолога', 'Подбор ухода и план процедур', 30, 800],
  ]
  for (const s of services) addService.run(...s)
}

export default db
