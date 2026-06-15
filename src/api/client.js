// API Client для общения с бекендом
const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    // В dev режиме используем VITE_API_URL если задан, иначе адрес локального бэкенда
    return import.meta.env.VITE_API_URL || 'http://localhost:8080'
  }
  // В production используется переменная окружения или текущий домен
  return import.meta.env.VITE_API_URL || ''
}

const API_BASE_URL = getApiBaseUrl()

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('auth_token')
    this.tempToken = sessionStorage.getItem('temp_token')
  }

  setToken(token) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  setTempToken(tempToken) {
    this.tempToken = tempToken
    if (tempToken) {
      sessionStorage.setItem('temp_token', tempToken)
    } else {
      sessionStorage.removeItem('temp_token')
    }
  }

  getToken() {
    return this.token
  }

  clearToken() {
    this.token = null
    this.tempToken = null
    localStorage.removeItem('auth_token')
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `API Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API Request Error: ${endpoint}`, error)
      throw error
    }
  }

  // Auth endpoints
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    if (response.token) {
      this.setToken(response.token)
    }
    if (response.temp_token) {
      this.setTempToken(response.temp_token)
    }
    return response
  }

  async verify2FA(code) {
    const response = await this.request('/auth/2fa/authenticate', {
      method: 'POST',
      body: JSON.stringify({ temp_token: this.tempToken, code }),
    })
    if (response.token) {
      this.setToken(response.token)
      this.setTempToken(null)
    }
    return response
  }

  async register(username, email, password) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    })
  }

  // Game endpoints
  async getActiveGame() {
    return await this.request('/game', {
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
    return await this.request('/matchmaking', {
      method: 'POST',
    })
  }

  async getMatchmakingStatus() {
    return await this.request('/matchmaking/status', {
      method: 'GET',
    })
  }

  async placeShips(ships) {
    return await this.request('/game/ships', {
      method: 'PUT',
      body: JSON.stringify({ ships }),
    })
  }

  async confirmShips() {
    return await this.request('/game/ships/confirm', {
      method: 'POST',
    })
  }

  async randomShips() {
    return await this.request('/game/ships/random', {
      method: 'POST',
    })
  }

  async makeMove(x, y) {
    return await this.request('/game/move', {
      method: 'POST',
      body: JSON.stringify({ x, y }),
    })
  }

  async getGameResult() {
    return await this.request('/game/result', {
      method: 'GET',
    })
  }

  async getGameHistory() {
    return await this.request('/game/history', {
      method: 'GET',
    })
  }

  async forfeitGame() {
    return await this.request('/game/forfeit', {
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
      body: JSON.stringify({ oldPassword, newPassword }),
    })
  }

  async getLeaderboard() {
    return await this.request('/leaderboard', {
      method: 'GET',
    })
  }
}

export const apiClient = new ApiClient()
