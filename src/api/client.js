const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8080' 
  : (import.meta.env.VITE_API_URL || '/api')

let wsToken = null

class ApiClient {
  setWsToken(token) {
    wsToken = token
  }

  getWsToken() {
    return wsToken
  }

  async refreshWsToken() {
    try {
      const data = await this.request('/auth/ws-token', { method: 'GET' })
      if (data.token) {
        wsToken = data.token
      }
      return data.token
    } catch {
      wsToken = null
      return null
    }
  }

  async request(endpoint, options = {}, retried = false) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = `${API_BASE_URL}${cleanEndpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      })

      if (response.status === 401 && !retried) {
        // Попробуем обновить токены
        const refreshed = await this.refreshAuth()
        if (refreshed) {
          return await this.request(endpoint, options, true)
        }
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        const safeMsg = {
          400: 'Неверный запрос',
          401: 'Требуется авторизация',
          403: 'Доступ запрещён',
          404: 'Ресурс не найден',
          409: 'Конфликт данных',
          429: 'Слишком много запросов',
        }[response.status] || 'Ошибка сервера'
        throw new Error(errorBody.error || errorBody.message || safeMsg)
      }

      return await response.json()
    } catch (error) {
      console.error(`API Request Error: ${endpoint}`, error)
      
      if (error instanceof TypeError || error.message?.includes('fetch')) {
        throw new Error('Не удалось связаться с игровым сервером. Проверьте интернет-соединение или подождите завершения технических работ.')
      }
      
      throw error
    }
  }

  async refreshAuth() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      if (!res.ok) return false
      const data = await res.json()
      if (data.user_id) {
        localStorage.setItem('user_id', data.user_id)
        if (data.username) localStorage.setItem('username', data.username)
        await this.refreshWsToken()
        return true
      }
      return false
    } catch {
      return false
    }
  }

  async checkAuth() {
    try {
      const data = await this.request('/auth/me', { method: 'GET' })
      if (data && data.user_id) {
        await this.refreshWsToken()
      }
      return data
    } catch {
      // Если /auth/me упал, пробуем refresh
      const refreshed = await this.refreshAuth()
      if (refreshed) {
        return await this.request('/auth/me', { method: 'GET' })
      }
      throw new Error('Не авторизован')
    }
  }

  async logout() {
    return await this.request('/auth/logout', { method: 'POST' })
  }

  async login(username, password) {
    return await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  async verify2FA(code) {
    return await this.request('/auth/2fa/authenticate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  async register(username, email, password) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    })
  }

  async getActiveGame() {
    return await this.request('/games/active', {
      method: 'GET',
    })
  }

  async createLobby(options) {
    return await this.request('/lobbies', {
      method: 'POST',
      body: JSON.stringify(options),
    })
  }

  async getLobbies() {
    return await this.request('/lobbies', {
      method: 'GET',
    })
  }

  async joinLobby(lobbyId) {
    return await this.request(`/lobbies/${lobbyId}/join`, {
      method: 'POST',
    })
  }

  async leaveLobby(lobbyId) {
    return await this.request(`/lobbies/${lobbyId}/leave`, {
      method: 'POST',
    })
  }

  async startMatchmaking() {
    return await this.request('/matchmaking/quick', {
      method: 'POST',
    })
  }

  async getMatchmakingStatus() {
    return await this.request('/matchmaking/status', {
      method: 'GET',
    })
  }

  async leaveMatchmaking() {
    return await this.request('/matchmaking/quick', {
      method: 'DELETE',
    })
  }

  async placeShips(gameId, ships) {
    if (!gameId) {
      throw new Error("Невозможно отправить корабли: отсутствует gameId")
    }
    return await this.request(`/games/${gameId}/ships`, {
      method: 'POST',
      body: JSON.stringify({ ships }),
    })
  }

  async shipsReset(gameId) {
    return await this.request(`/games/${gameId}/ships/reset`, {
      method: 'POST',
    })
  }

  async shipsConfirm(gameId) {
    return await this.request(`/games/${gameId}/ships/confirm`, {
      method: 'POST',
    })
  }

  async makeMove(gameId, x, y) {
    return await this.request(`/games/${gameId}/move`, {
      method: 'POST',
      body: JSON.stringify({ x, y }),
    })
  }

  async forfeitGame(gameId) {
    return await this.request(`/games/${gameId}/forfeit`, {
      method: 'POST',
    })
  }

  async rematchGame(gameId) {
    return await this.request(`/games/${gameId}/rematch`, {
      method: 'POST',
    })
  }

  async getProfile() {
    return await this.request('/profile', {
      method: 'GET',
    })
  }

  async updatePassword(oldPassword, newPassword) {
    return await this.request('/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    })
  }

  async sendForgotPasswordCode(username) {
    return await this.request('/auth/password/forgot/send-code', {
      method: 'POST',
      body: JSON.stringify({ username }),
    })
  }

  async resetForgotPassword(username, code, newPassword) {
    return await this.request('/auth/password/forgot/reset', {
      method: 'POST',
      body: JSON.stringify({ username, code, new_password: newPassword }),
    })
  }

  async getLeaderboard(limit = 15) {
    return await this.request(`/leaderboard?limit=${limit}`, {
      method: 'GET',
    })
  }

  async updateProfile(username) {
    return await this.request('/profile', {
      method: 'PATCH',
      body: JSON.stringify({ username }),
    })
  }

  async setup2FA() {
    return await this.request('/auth/2fa/setup', {
      method: 'POST',
    })
  }

  async verify2FASetup(code) {
    return await this.request('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  async disable2FA(password) {
    return await this.request('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
  }

  async getShop() {
    return await this.request('/shop', { method: 'GET' })
  }

  async buyFish(fishId) {
    return await this.request('/buy_fish', {
      method: 'POST',
      body: JSON.stringify({ fishId }),
    })
  }

  async equipFish(fishIds) {
    return await this.request('/equip_fish', {
      method: 'POST',
      body: JSON.stringify({ fishIds }),
    })
  }

  async getMatchHistory(page = 1, limit = 20) {
    return await this.request(`/games/history?page=${page}&limit=${limit}`, { method: 'GET' })
  }

}

export const apiClient = new ApiClient()
