<template>
  <div class="w-full max-w-md bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] font-mono text-black select-none shadow-sm flex flex-col justify-between">
    
    <div>
      <div class="bg-gradient-to-r from-[#000080] to-[#033da9] text-white px-2 py-1 flex justify-between items-center font-bold text-xs m-0 mb-4">
        <div class="flex items-center gap-1">
          <span>{{ isLoginMode ? 'Log In' : 'Sign Up' }}</span>
          <span v-if="DEBUG_MODE" class="ml-2 bg-red-600 text-[9px] px-1 animate-pulse text-white border border-white">DEBUG MODE BILS</span>
        </div>
        <button 
          @click.stop="resetToInitial"
          type="button"
          class="bg-[#d4d0c8] text-black w-4 h-4 flex items-center justify-center text-xs font-sans font-bold border border-t-white border-l-white border-b-black border-r-black cursor-pointer active:border-t-black active:border-l-black outline-none"
        >
          ✕
        </button>
      </div>

      <div class="p-3">
        <div v-if="step !== 'otp'" class="flex gap-[2px] mb-4 border-b-2 border-[#808080] pb-[2px]">
          <button 
            @click="isLoginMode = true; statusMessage = ''; step = 'credentials'"
            type="button"
            class="px-4 py-1 text-xs font-bold border-2 outline-none"
            :class="isLoginMode 
              ? 'bg-[#d4d0c8] border-t-white border-l-white border-b-transparent border-r-black font-extrabold translate-y-[2px]' 
              : 'bg-[#c0c0c0] border-t-white border-l-white border-b-[#808080] border-r-black opacity-80'"
          >
            Log In
          </button>
          <button 
            @click="isLoginMode = false; statusMessage = ''; step = 'credentials'"
            type="button"
            class="px-4 py-1 text-xs font-bold border-2 outline-none"
            :class="!isLoginMode 
              ? 'bg-[#d4d0c8] border-t-white border-l-white border-b-transparent border-r-black font-extrabold translate-y-[2px]' 
              : 'bg-[#c0c0c0] border-t-white border-l-white border-b-[#808080] border-r-black opacity-80'"
          >
            Sign Up
          </button>
        </div>

        <div class="flex flex-col gap-3">
          <template v-if="step === 'credentials'">
            <input 
              v-model="username" 
              type="text" 
              placeholder="Username" 
              class="p-2 bg-white text-black outline-none text-xs border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white" 
            />
            
            <input 
              v-if="!isLoginMode"
              v-model="email" 
              type="email" 
              placeholder="Email Address" 
              class="p-2 bg-white text-black outline-none text-xs border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white" 
            />

            <input 
              v-model="password" 
              type="password" 
              placeholder="Password" 
              class="p-2 bg-white text-black outline-none text-xs border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white" 
            />
            
            <div class="flex gap-2 mt-1">
              <button 
                @click="handleCredentialsSubmit" 
                type="button"
                class="px-4 py-2 bg-[#d4d0c8] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black text-xs font-bold outline-none"
              >
                {{ isLoginMode ? 'Log In' : 'Sign Up' }}
              </button>
            </div>
          </template>

          <template v-else-if="step === 'otp'">
            <div class="text-xs font-bold mb-1 text-gray-700">
              📡 Please enter the secure one-time verification code sent to your e-mail:
            </div>
            <input 
              v-model="otpCode" 
              type="text" 
              placeholder="Enter OTP Code" 
              class="p-2 bg-white text-black outline-none text-center font-bold tracking-widest text-xs border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white" 
            />
            
            <div class="flex gap-2 mt-1 justify-between">
              <button 
                @click="step = 'credentials'; statusMessage = ''" 
                type="button"
                class="px-3 py-1 bg-[#d4d0c8] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black text-xs outline-none"
              >
                Back
              </button>
              <button 
                @click="handleVerifyOtp" 
                type="button"
                class="px-4 py-1 bg-[#d4d0c8] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black text-xs font-bold outline-none"
              >
                Verify Code
              </button>
            </div>
          </template>
        </div>

        <div v-if="statusMessage" class="mt-4 p-2 text-xs border border-dashed font-bold tracking-wide break-all"
             :class="statusType === 'error' ? 'text-red-700 border-red-500 bg-red-50' : 'text-green-700 border-green-500 bg-green-50'">
          {{ statusMessage }}
        </div>
      </div>
    </div>

    <div class="w-full text-center text-[10px] text-gray-500 font-bold tracking-wider pt-2 pb-4 border-t border-gray-400 opacity-60 mt-4 select-none">
      &copy; Powered by KGBT+
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { apiClient } from '../api/client' // Импортируем наш исправленный клиент

const DEBUG_MODE = ref(false) 

const username = ref('')
const email = ref('')
const password = ref('')
const otpCode = ref('')

const isLoginMode = ref(true) 
const step = ref('credentials') 

const statusMessage = ref('')
const statusType = ref('error')

const emit = defineEmits(['login-success', 'close'])

const resetToInitial = () => {
  step.value = 'credentials'
  isLoginMode.value = true
  statusMessage.value = ''
  otpCode.value = ''
  username.value = ''
  email.value = ''
  password.value = ''
  
  emit('close')
}

const handleCredentialsSubmit = async () => {
  statusMessage.value = ''
  
  if (DEBUG_MODE.value) {
    statusType.value = 'success'
    statusMessage.value = '⚠️ [DEBUG MODE] Перевожу на OTP...'
    setTimeout(() => {
      step.value = 'otp'
      statusMessage.value = ''
    }, 500)
    return
  }

  if (isLoginMode.value) {
    try {
      // ИСПРАВЛЕНО: Используем метод авторизации через единый apiClient
      const response = await apiClient.login(username.value, password.value)

      // Внутри apiClient.login() метод сам проверяет ответ бэкенда.
      // Если бэк вернул 200 + токен, он автоматически запишет его в localStorage под ключом 'token'
      if (response.token) {
        localStorage.setItem('token', response.token) // Дублируем для совместимости с App.vue
        localStorage.setItem('username', username.value)
        statusType.value = 'success'
        statusMessage.value = '🚀 Access granted! Welcome back.'
        setTimeout(() => {
          emit('login-success')
        }, 1000)
      } else if (response.temp_token) {
        // Если бэк вернул 202 (требуется 2FA), apiClient сохранил temp_token в sessionStorage
        statusType.value = 'success'
        statusMessage.value = '📧 Password accepted. A secure 2FA code has been dispatched to your email.'
        setTimeout(() => {
          step.value = 'otp'
          statusMessage.value = ''
        }, 1200)
      }

    } catch (err) {
      statusType.value = 'error'
      if (err.message && err.message.includes('401')) {
        statusMessage.value = '❌ Authentication failed: Invalid username or password.'
      } else {
        statusMessage.value = `❌ Ошибка входа: ${err.message || 'Connection refused'}`
      }
    }
  } else {
    try {
      // ИСПРАВЛЕНО: Используем метод регистрации через apiClient
      await apiClient.register(username.value, email.value, password.value)

      statusType.value = 'success'
      statusMessage.value = '📧 Verification code successfully transmitted to your email.'
      
      setTimeout(() => {
        step.value = 'otp'
        statusMessage.value = ''
      }, 1200)

    } catch (err) {
      statusType.value = 'error'
      statusMessage.value = `❌ Ошибка регистрации: ${err.message || 'Connection refused'}`
    }
  }
}

const handleVerifyOtp = async () => {
  statusMessage.value = ''

  try {
    // ИСПРАВЛЕНО: Используем метод подтверждения 2FA кода через apiClient (/auth/2fa/authenticate)
    const response = await apiClient.verify2FA(otpCode.value)

    // Если бэкенд отдал полноценный JWT токен
    if (response.token) {
      localStorage.setItem('token', response.token) // ИСПРАВЛЕНО: Пишем в 'token' вместо 'auth_token'
      localStorage.setItem('username', username.value)
      statusType.value = 'success'
      statusMessage.value = '🚀 Access granted! Loading...'
      
      setTimeout(() => {
        emit('login-success')
      }, 1500)
    } else {
      // Если токен не пришел сразу (например, после верификации новой регистрации), переводим в режим логина
      statusType.value = 'success'
      statusMessage.value = '🎉 Identity verified successfully! Please log in.'
      
      setTimeout(() => {
        isLoginMode.value = true
        step.value = 'credentials'
        otpCode.value = ''
        statusMessage.value = ''
      }, 2000)
    }
  } catch (err) {
    statusType.value = 'error'
    statusMessage.value = `❌ Ошибка проверки OTP: ${err.message}`
  }
}
</script>