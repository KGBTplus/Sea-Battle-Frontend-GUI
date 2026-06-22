const API_BASE = '/api'

export class ApiClient {
  constructor() {
    this.baseUrl = API_BASE
  }

  async request(path, options = {}) {
    const token = localStorage.getItem('token')
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    })
    if (response.status === 204) {
      return null
    }
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}`)
    }
    return data
  }

  async register(username, password, email) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email }),
    })
  }

  async login(username, password) {
    return await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  async setup2FA() {
    return await this.request('/auth/2fa/setup', { method: 'POST' })
  }

  async verify2FASetup(code) {
    return await this.request('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  async authenticate2FA(tempToken, code) {
    return await this.request('/auth/2fa/authenticate', {
      method: 'POST',
      body: JSON.stringify({ temp_token: tempToken, code }),
    })
  }

  async disable2FA(password) {
    return await this.request('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
  }

  async getProfile() {
    return await this.request('/profile', { method: 'GET' })
  }

  async updateProfile(username) {
    return await this.request('/profile', {
      method: 'PATCH',
      body: JSON.stringify({ username }),
    })
  }

  async changePassword(oldPassword, newPassword) {
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

  async getActiveGame() {
    return await this.request('/games/active', { method: 'GET' })
  }

  async getLobbies() {
    return await this.request('/lobbies', { method: 'GET' })
  }

  async createLobby(options) {
    return await this.request('/lobbies', {
      method: 'POST',
      body: JSON.stringify(options),
    })
  }

  async joinLobby(lobbyId) {
    return await this.request(`/lobbies/${lobbyId}/join`, { method: 'POST' })
  }

  async leaveLobby(lobbyId) {
    return await this.request(`/lobbies/${lobbyId}/leave`, { method: 'POST' })
  }

  async startMatchmaking() {
    return await this.request('/matchmaking/quick', { method: 'POST' })
  }

  async getMatchmakingStatus() {
    return await this.request('/matchmaking/status', { method: 'GET' })
  }

  async leaveMatchmaking() {
    return await this.request('/matchmaking/quick', { method: 'DELETE' })
  }

  async placeShips(gameId, ships) {
    if (!gameId) throw new Error("Невозможно отправить корабли: отсутствует gameId")
    return await this.request(`/games/${gameId}/ships`, {
      method: 'POST',
      body: JSON.stringify({ ships }),
    })
  }

  async shipsReset(gameId) {
    return await this.request(`/games/${gameId}/ships/reset`, { method: 'POST' })
  }

  async shipsConfirm(gameId) {
    return await this.request(`/games/${gameId}/ships/confirm`, { method: 'POST' })
  }

  async shipsRandom(gameId) {
    return await this.request(`/games/${gameId}/ships/random`, { method: 'POST' })
  }

  async makeMove(gameId, x, y) {
    return await this.request(`/games/${gameId}/move`, {
      method: 'POST',
      body: JSON.stringify({ x, y }),
    })
  }

  async forfeitGame(gameId) {
    return await this.request(`/games/${gameId}/forfeit`, { method: 'POST' })
  }

  async rematchGame(gameId) {
    return await this.request(`/games/${gameId}/rematch`, { method: 'POST' })
  }

  async getLeaderboard(limit = 15) {
    return await this.request(`/leaderboard?limit=${limit}`, { method: 'GET' })
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

  async getInventory() {
    return await this.request('/inventory', { method: 'GET' })
  }

  async toggleFish(fishId, active) {
    return await this.request('/inventory/toggle', {
      method: 'POST',
      body: JSON.stringify({ fishId, active }),
    })
  }

  async getMatchHistory(page = 1, limit = 20) {
    return await this.request(`/games/history?page=${page}&limit=${limit}`, { method: 'GET' })
  }

  async getAchievements() {
    return await this.request('/achievements', { method: 'GET' })
  }

  async claimAchievement(achievementId) {
    return await this.request('/achievements/claim', {
      method: 'POST',
      body: JSON.stringify({ achievement_id: achievementId }),
    })
  }

  async checkAuth() {
    try {
      return await this.request('/auth/me', { method: 'GET' })
    } catch {
      return null
    }
  }

  async logout() {
    return await this.request('/auth/logout', { method: 'POST' })
  }

  async refreshWsToken() {
    return await this.request('/auth/refresh', { method: 'POST' })
  }
}

export const apiClient = new ApiClient()
