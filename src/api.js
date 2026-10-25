const TOKEN_KEY = 'token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// Ошибка API: message — текст для пользователя, fields — ошибки по полям формы
export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message)
    this.status = status
    this.fields = fields || {}
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const token = getToken()
  let response

  try {
    response = await fetch('/api' + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Нет связи с сервером. Проверьте подключение.', 0)
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // ответ без JSON
  }

  if (!response.ok) {
    const message =
      data?.error ||
      (response.status >= 500
        ? 'Сервер недоступен. Убедитесь, что он запущен.'
        : `Ошибка запроса (${response.status})`)
    throw new ApiError(message, response.status, data?.fields)
  }

  return data
}
