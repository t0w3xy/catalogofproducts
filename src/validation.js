const EMAIL_RE = /^\S+@\S+\.\S+$/

// Проверка полей email и пароль. Возвращает объект ошибок (пустой — всё верно)
export function validateCredentials({ email, password }) {
  const errors = {}

  if (!email.trim()) errors.email = 'Введите email'
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'Некорректный email'

  if (!password) errors.password = 'Введите пароль'
  else if (password.length < 6) errors.password = 'Пароль не короче 6 символов'

  return errors
}
