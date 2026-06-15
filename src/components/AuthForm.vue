<template>
  <div class="w-full max-w-md bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] shadow-[1px_1px_0_0_#000] pt-0 font-mono text-black select-none">
    
    <div class="bg-gradient-to-r from-[#000080] to-blue-800 text-white px-2 py-1 flex justify-between items-center font-bold text-sm">
      <div class="flex items-center space-x-2">
        <span>⚓</span>
          <span>{{ is2FAStage ? 'Защита аккаунта' : isRegisterMode ? 'Регистрация' : 'Вход в игру' }}</span>
        </div>
        <button
          @click="$emit('close')" 
          type="button"
          class="bg-[#d4d0c8] text-black border border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] w-4 h-4 flex items-center justify-center text-xs font-bold pb-0.5 active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff]
        shadow-[inset_0_12px_20px_-6px_rgba(255,255,255,0.5),inset_0_-12px_12px_-6px_rgba(0,0,0,0.3)]
        active:shadow-[inset_0_4px_6px_rgba(0,0,0,0.6)]"
        >
          ✕
        </button>
      </div>

    <div class="p-4">
      <div class="mb-6">
        <p class="text-xs text-black leading-tight">
          {{ is2FAStage ? 'Введите 6-значный код из Google Authenticator:' : isRegisterMode ? 'Заполните поля для создания аккаунта:' : 'Авторизуйтесь, чтобы начать бой:' }}
        </p>
      </div>
      <div v-if="errorMessage" class="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 text-xs rounded">
        {{ errorMessage }}
      </div>

      <form v-if="!is2FAStage" @submit.prevent="isRegisterMode ? handleRegister() : handleLogin()" class="space-y-5">
        <div>
          <label class="block text-xs font-bold mb-1">Имя пользователя:</label>
          <input 
            v-model="loginForm.username"
            type="text" 
            required
            placeholder="Ваш никнейм"
            class="w-full bg-white text-black text-sm px-2 py-1.5 outline-none border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] focus:bg-white"
          />
        </div>

        <div v-if="isRegisterMode">
          <label class="block text-xs font-bold mb-1">Email:</label>
          <input 
            v-model="loginForm.email"
            type="email" 
            required
            placeholder="example@mail.com"
            class="w-full bg-white text-black text-sm px-2 py-1.5 outline-none border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] focus:bg-white"
          />
        </div>

        <div>
          <label class="block text-xs font-bold mb-1">Пароль:</label>
          <input 
            v-model="loginForm.password"
            type="password" 
            required
            placeholder="••••••••"
            class="w-full bg-white text-black text-sm px-2 py-1.5 outline-none border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] focus:bg-white"
          />
        </div>

        <button 
          type="submit"
          :disabled="isLoading"
          class="w-full bg-[#d4d0c8] text-black text-sm font-bold py-2 px-4 border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#003c6c] active:border-l-[#003c6c] active:border-b-[#fff] active:border-r-[#fff] shadow-[inset_0_12px_6px_-6px_rgba(255,255,255,0.5),inset_0_-12px_12px_-6px_rgba(0,0,0,0.4)] active:shadow-[inset_0_4px_6px_rgba(0,0,0,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Подождите...' : isRegisterMode ? 'Зарегистрироваться' : 'Войти' }}
        </button>

        <button
          type="button"
          @click="toggleRegisterMode"
          :disabled="isLoading"
          class="w-full bg-[#d4d0c8] text-black text-sm font-bold py-2 px-4 border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#003c6c] active:border-l-[#003c6c] active:border-b-[#fff] active:border-r-[#fff] shadow-[inset_0_12px_6px_-6px_rgba(255,255,255,0.5),inset_0_-12px_12px_-6px_rgba(0,0,0,0.4)] active:shadow-[inset_0_4px_6px_rgba(0,0,0,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться' }}
        </button>
      </form>

      <form v-else @submit.prevent="handle2FA" class="space-y-6">
        <div>
          <label class="block text-xs font-bold mb-1 text-center">Код подтверждения:</label>
          <input 
            v-model="twoFactorCode"
            type="text" 
            maxlength="6"
            required
            placeholder="000000"
            class="w-full bg-white text-black text-xl font-mono tracking-[0.3em] text-center py-2 outline-none border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] focus:bg-white"
          />
        </div>

        <div class="flex flex-col space-y-3">
          <button 
            type="submit"
            :disabled="isLoading"
            class="w-full bg-[#d4d0c8] text-black text-sm font-bold py-2 px-4 border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] shadow-[1px_1px_0_0_#000] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Подождите...' : 'Подтвердить и войти' }}
          </button>
          
          <button 
            @click="is2FAStage = false" 
            type="button"
            :disabled="isLoading"
            class="w-full bg-[#d4d0c8] text-black text-xs py-1 px-4 border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] shadow-[1px_1px_0_0_#000] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Вернуться назад
          </button>
        </div>
      </form>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { apiClient } from '../api/client.js'

// Переключатель этапов авторизации
const is2FAStage = ref(false)
const isRegisterMode = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const loginForm = ref({
  username: '',
  password: '',
  email: ''
})

const twoFactorCode = ref('')

const toggleRegisterMode = () => {
  isRegisterMode.value = !isRegisterMode.value
  errorMessage.value = ''
}

// Обработка регистрации
const handleRegister = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await apiClient.register(loginForm.value.username, loginForm.value.email, loginForm.value.password)
    errorMessage.value = 'Регистрация прошла успешно. Войдите в систему.'
    isRegisterMode.value = false
    loginForm.value.password = ''
  } catch (error) {
    errorMessage.value = error.message || 'Ошибка регистрации'
    console.error('Register error:', error)
  } finally {
    isLoading.value = false
  }
}

// Обработка первого этапа (Логин/Пароль)
const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await apiClient.login(loginForm.value.username, loginForm.value.password)

    if (response.temp_token) {
      is2FAStage.value = true
      errorMessage.value = 'Код отправлен на email'
    } else {
      alert('Вход выполнен без 2FA')
      // Если нужно, здесь можно выполнить переход в игру или закрыть модал
    }
  } catch (error) {
    errorMessage.value = error.message || 'Ошибка входа'
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}

// Обработка второго этапа (2FA код)
const handle2FA = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    await apiClient.verify2FA(twoFactorCode.value)
    alert('Успешный вход!')
    // Здесь можно добавить переход на главную страницу игры
    // this.$router.push('/game') или window.location.href = '/game'
  } catch (error) {
    errorMessage.value = error.message || 'Ошибка подтверждения 2FA'
    console.error('2FA error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>