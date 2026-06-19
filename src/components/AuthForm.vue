<template>
  <div class="w-full max-w-md bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] font-mono text-black select-none shadow-sm flex flex-col justify-between">
    
    <div>
      <div class="bg-gradient-to-r from-[#000080] to-[#033da9] text-white px-2 py-1 flex justify-between items-center font-bold text-xs m-0 mb-4">
        <div class="flex items-center gap-1">
          <span>{{ isLoginMode ? 'Войти' : 'Регистрация' }}</span>
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
            Войти
          </button>
          <button 
            @click="isLoginMode = false; statusMessage = ''; step = 'credentials'"
            type="button"
            class="px-4 py-1 text-xs font-bold border-2 outline-none"
            :class="!isLoginMode 
              ? 'bg-[#d4d0c8] border-t-white border-l-white border-b-transparent border-r-black font-extrabold translate-y-[2px]' 
              : 'bg-[#c0c0c0] border-t-white border-l-white border-b-[#808080] border-r-black opacity-80'"
          >
            Регистрация
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

            <div class="relative">
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="Password" 
                class="w-full p-2 bg-white text-black outline-none text-xs border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white pr-8" 
              />
              <button
                @click="showPassword = !showPassword"
                type="button"
                class="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 px-1 outline-none"
              >
                {{ showPassword ? '🙈' : '👁' }}
              </button>
            </div>
            
            <div class="flex gap-2 mt-1">
              <button 
                @click="handleCredentialsSubmit" 
                :disabled="isSubmitting"
                type="button"
                class="px-4 py-2 bg-[#d4d0c8] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black text-xs font-bold outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSubmitting ? '⏳' : (isLoginMode ? 'Войти' : 'Регистрация') }}
              </button>
            </div>
            <div v-if="isLoginMode" class="text-center mt-2">
              <button
                @click="switchToForgotPassword"
                type="button"
                class="text-[10px] text-gray-500 hover:text-gray-800 underline underline-offset-2 opacity-60 hover:opacity-100 outline-none"
              >
                Забыли пароль?
              </button>
            </div>
          </template>

          <template v-else-if="step === 'forgot-password'">
            <div class="text-xs font-bold mb-1 text-gray-700">
              Код отправлен на вашу почту (если пользователь существует и email подтверждён)
            </div>
            <input
              v-model="forgotCode"
              type="text"
              placeholder="Код"
              class="w-full mb-2 p-2 bg-white text-black outline-none text-center font-bold tracking-widest text-xs border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white"
            />
            <div class="relative mb-2">
              <input
                v-model="forgotNewPassword"
                :type="showForgotNew ? 'text' : 'password'"
                placeholder="Новый пароль (от 8 символов)"
                class="w-full p-2 bg-white text-black outline-none text-xs border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white pr-8"
              />
              <button
                @click="showForgotNew = !showForgotNew"
                type="button"
                class="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 px-1 outline-none"
              >
                {{ showForgotNew ? '🙈' : '👁' }}
              </button>
            </div>
            <div class="relative mb-2">
              <input
                v-model="forgotConfirmPassword"
                :type="showForgotConfirm ? 'text' : 'password'"
                placeholder="Повторите пароль"
                class="w-full p-2 bg-white text-black outline-none text-xs border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white pr-8"
              />
              <button
                @click="showForgotConfirm = !showForgotConfirm"
                type="button"
                class="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 px-1 outline-none"
              >
                {{ showForgotConfirm ? '🙈' : '👁' }}
              </button>
            </div>
            <div class="flex gap-2">
              <button
                @click="step = 'credentials'"
                type="button"
                class="px-3 py-1 bg-[#d4d0c8] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black text-xs outline-none"
              >
                Назад
              </button>
              <button
                @click="handleForgotPasswordReset"
                :disabled="isSubmitting"
                type="button"
                class="px-4 py-1 bg-[#d4d0c8] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black text-xs font-bold outline-none disabled:opacity-50 ml-auto"
              >
                {{ isSubmitting ? '⏳' : 'Сбросить пароль' }}
              </button>
            </div>
          </template>

          <template v-else-if="step === 'otp'">
            <div class="text-xs font-bold mb-1 text-gray-700">
              📡 Введите код, отправленный на вашу почту (проверьте папку спам):
            </div>
            <input 
              v-model="otpCode" 
              type="text" 
              placeholder="Код" 
              class="p-2 bg-white text-black outline-none text-center font-bold tracking-widest text-xs border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white" 
            />
            
            <div class="flex gap-1 mt-1">
              <button 
                @click="step = 'credentials'; statusMessage = ''" 
                :disabled="isSubmitting"
                type="button"
                class="px-3 py-1 bg-[#d4d0c8] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black text-xs outline-none disabled:opacity-50"
              >
                Назад
              </button>
              <button 
                @click="handleResendCode" 
                :disabled="isSubmitting"
                type="button"
                class="px-3 py-1 bg-[#c0c0c0] border border-t-white border-l-white border-b-gray-500 border-r-gray-500 text-[10px] outline-none hover:bg-[#d4d0c8] disabled:opacity-50"
              >
                {{ isSubmitting ? '⏳' : '📧 Выслать код повторно' }}
              </button>
              <button 
                @click="handleVerifyOtp" 
                :disabled="isSubmitting"
                type="button"
                class="px-4 py-1 bg-[#d4d0c8] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black text-xs font-bold outline-none disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                {{ isSubmitting ? '⏳' : 'Далее' }}
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
import { apiClient } from '../api/client'

const username = ref('')
const email = ref('')
const password = ref('')
const otpCode = ref('')

const showPassword = ref(false)

const forgotEmailMask = ref('')
const forgotCode = ref('')
const forgotNewPassword = ref('')
const forgotConfirmPassword = ref('')
const showForgotNew = ref(false)
const showForgotConfirm = ref(false)

const isLoginMode = ref(true)
const step = ref('credentials')
const isSubmitting = ref(false)

const statusMessage = ref('')
const statusType = ref('error')

const emit = defineEmits(['login-success', 'close'])

const resetToInitial = () => {
  step.value = 'credentials'
  isLoginMode.value = true
  isSubmitting.value = false
  statusMessage.value = ''
  otpCode.value = ''
  username.value = ''
  email.value = ''
  password.value = ''
  emit('close')
}

const loginSuccess = (usernameVal) => {
  localStorage.setItem('username', usernameVal)
  statusType.value = 'success'
  statusMessage.value = '🚀 Доступ разрешён!'
  setTimeout(() => {
    emit('login-success')
    isSubmitting.value = false
  }, 800)
}

const handleCredentialsSubmit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  statusMessage.value = ''

  try {
    let response
    if (isLoginMode.value) {
      response = await apiClient.login(username.value, password.value)
    } else {
      response = await apiClient.register(username.value, email.value, password.value)
    }

    if (response.token) {
      apiClient.setToken(response.token)
      loginSuccess(username.value)
    } else if (response.temp_token) {
      apiClient.setTempToken(response.temp_token)
      statusType.value = 'success'
      statusMessage.value = '📧 Код отправлен на email'
      setTimeout(() => {
        step.value = 'otp'
        statusMessage.value = ''
      }, 800)
    }
  } catch (err) {
    if (err.message?.includes('409') || err.message?.includes('already exists')) {
      statusType.value = 'error'
      statusMessage.value = '❌ Пользователь с таким именем или email уже существует'
    } else {
      statusType.value = 'error'
      statusMessage.value = `❌ ${err.message || 'Ошибка подключения к серверу'}`
    }
  } finally {
    if (step.value === 'credentials') isSubmitting.value = false
  }
}

const handleResendCode = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  statusMessage.value = ''

  try {
    let response
    if (isLoginMode.value) {
      response = await apiClient.login(username.value, password.value)
    } else {
      response = await apiClient.register(username.value, email.value, password.value)
    }

    if (response.token) {
      apiClient.setToken(response.token)
      loginSuccess(username.value)
    } else if (response.temp_token) {
      apiClient.setTempToken(response.temp_token)
      statusType.value = 'success'
      statusMessage.value = '📧 Код отправлен повторно'
      setTimeout(() => { statusMessage.value = '' }, 3000)
    }
  } catch (err) {
    statusType.value = 'error'
    statusMessage.value = `❌ ${err.message || 'Ошибка отправки кода'}`
  } finally {
    isSubmitting.value = false
  }
}

const handleVerifyOtp = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  statusMessage.value = ''

  try {
    const response = await apiClient.verify2FA(otpCode.value)
    if (response.token) {
      apiClient.setToken(response.token)
      loginSuccess(username.value)
    }
  } catch (err) {
    statusType.value = 'error'
    statusMessage.value = `❌ ${err.message || 'Неверный код подтверждения'}`
  } finally {
    isSubmitting.value = false
  }
}

const switchToForgotPassword = () => {
  if (!username.value.trim()) {
    statusType.value = 'error'
    statusMessage.value = '❌ Сначала введите username'
    return
  }
  statusMessage.value = ''
  forgotEmailMask.value = ''
  forgotCode.value = ''
  forgotNewPassword.value = ''
  forgotConfirmPassword.value = ''
  showForgotNew.value = false
  showForgotConfirm.value = false
  handleForgotPasswordSendCode()
}

const handleForgotPasswordSendCode = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  statusMessage.value = ''
  try {
    await apiClient.sendForgotPasswordCode(username.value.trim())
    forgotEmailMask.value = ''
    step.value = 'forgot-password'
    statusType.value = 'success'
    statusMessage.value = 'Если пользователь с таким именем существует и email подтверждён, код отправлен на почту'
  } catch (err) {
    statusType.value = 'error'
    statusMessage.value = `❌ ${err.message || 'Ошибка отправки кода'}`
  } finally {
    isSubmitting.value = false
  }
}

const handleForgotPasswordReset = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  statusMessage.value = ''

  if (forgotNewPassword.value !== forgotConfirmPassword.value) {
    statusType.value = 'error'
    statusMessage.value = '❌ Пароли не совпадают'
    isSubmitting.value = false
    return
  }

  try {
    await apiClient.resetForgotPassword(username.value.trim(), forgotCode.value.trim(), forgotNewPassword.value)
    statusType.value = 'success'
    statusMessage.value = '✅ Пароль изменён. Теперь войдите с новым паролем.'
    setTimeout(() => {
      step.value = 'credentials'
      isLoginMode.value = true
      forgotCode.value = ''
      forgotNewPassword.value = ''
      forgotConfirmPassword.value = ''
    }, 2000)
  } catch (err) {
    statusType.value = 'error'
    statusMessage.value = `❌ ${err.message || 'Ошибка сброса пароля'}`
  } finally {
    isSubmitting.value = false
  }
}
</script>