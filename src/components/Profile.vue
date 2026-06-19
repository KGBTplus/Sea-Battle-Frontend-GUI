<template>
  <div class="w-full max-w-2xl mx-auto">
    <div class="bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-3 mb-4 font-mono text-black select-none shadow-[1px_1px_0_0_#000,inset_0_12px_16px_-6px_rgba(255,255,255,0.6)]">
      <div class="flex justify-between items-center mb-3">
        <h1 class="text-2xl font-faero tracking-wider text-black">Профиль</h1>
        <button
          @click="$emit('close')"
          class="px-4 py-1 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-sm font-bold hover:bg-[#c0bdb8]"
        >
          Назад
        </button>
      </div>

      <div v-if="loading" class="text-center py-8 text-sm opacity-70">Загрузка...</div>
      <div v-else-if="error" class="text-center py-8 text-sm text-red-600">{{ error }}</div>

      <template v-else>
        <!-- Информация об игроке -->
        <div class="bg-gray-100 border border-gray-400 p-3 mb-3 text-sm">
          <div class="grid grid-cols-2 gap-y-2">
            <span class="text-gray-600">Игрок:</span>
            <span class="font-bold">{{ profile.username }}</span>
            <span class="text-gray-600">Email:</span>
            <span>{{ profile.email }}</span>
            <span class="text-gray-600">Зарегистрирован:</span>
            <span>{{ formatDate(profile.created_at) }}</span>
          </div>
        </div>

        <!-- Статистика -->
        <div class="bg-gray-100 border border-gray-400 p-3 mb-3 text-sm">
          <h2 class="font-bold text-blue-900 mb-2">Статистика</h2>
          <div class="grid grid-cols-2 gap-y-2">
            <span class="text-gray-600">Всего игр:</span>
            <span class="font-bold">{{ profile.total_games }}</span>
            <span class="text-gray-600">Побед:</span>
            <span class="font-bold text-green-700">{{ profile.wins }}</span>
            <span class="text-gray-600">Поражений:</span>
            <span class="font-bold text-red-700">{{ profile.losses }}</span>
            <span class="text-gray-600">% побед:</span>
            <span class="font-bold">{{ formatPct(profile.win_percentage) }}</span>
            <span class="text-gray-600">Потоплено кораблей:</span>
            <span class="font-bold">{{ profile.ships_sunk }}</span>
            <span class="text-gray-600">Всего выстрелов:</span>
            <span class="font-bold">{{ profile.total_shots }}</span>
            <span class="text-gray-600">Попаданий:</span>
            <span class="font-bold">{{ profile.hits }}</span>
            <span class="text-gray-600">% попаданий:</span>
            <span class="font-bold">{{ formatPct(profile.hit_percentage) }}</span>
          </div>
        </div>

        <!-- Смена ника -->
        <div class="bg-gray-100 border border-gray-400 p-3 mb-3 text-sm">
          <h2 class="font-bold text-blue-900 mb-2">Сменить никнейм</h2>
          <div class="flex gap-2">
            <input
              v-model="newUsername"
              @keyup.enter="changeUsername"
              placeholder="Новый никнейм (4-16 символов)"
              class="flex-1 px-2 py-1 border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] bg-white text-xs outline-none"
            />
            <button
              @click="changeUsername"
              :disabled="!newUsername.trim()"
              class="px-3 py-1 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-xs font-bold disabled:opacity-50"
            >
              Сохранить
            </button>
          </div>
          <p v-if="usernameError" class="text-red-600 text-xs mt-1">{{ usernameError }}</p>
          <p v-if="usernameSuccess" class="text-green-700 text-xs mt-1">{{ usernameSuccess }}</p>
        </div>

        <!-- 2FA -->
        <div class="bg-gray-100 border border-gray-400 p-3 mb-3 text-sm">
          <h2 class="font-bold text-blue-900 mb-2">Двухфакторная аутентификация</h2>
          <p class="text-xs text-gray-600 mb-2">
            Статус: <span :class="profile.otp_enabled ? 'text-green-700 font-bold' : 'text-gray-500'">{{ profile.otp_enabled ? 'Включена' : 'Выключена' }}</span>
          </p>

          <div v-if="!profile.otp_enabled">
            <button
              @click="start2FASetup"
              :disabled="twoFaLoading"
              class="px-3 py-1 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-xs font-bold disabled:opacity-50"
            >
              Включить 2FA
            </button>

            <div v-if="twoFaStep === 'code'" class="mt-2 flex gap-2 items-center">
              <input
                v-model="twoFaCode"
                @keyup.enter="confirm2FASetup"
                placeholder="Код из email"
                class="w-32 px-2 py-1 border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] bg-white text-xs outline-none"
              />
              <button
                @click="confirm2FASetup"
                :disabled="!twoFaCode.trim()"
                class="px-3 py-1 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-xs font-bold disabled:opacity-50"
              >
                Подтвердить
              </button>
            </div>
          </div>

          <div v-else>
            <button
              @click="disable2FA"
              :disabled="twoFaLoading"
              class="px-3 py-1 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-xs font-bold disabled:opacity-50"
            >
              Отключить 2FA
            </button>
          </div>

          <p v-if="twoFaError" class="text-red-600 text-xs mt-1">{{ twoFaError }}</p>
          <p v-if="twoFaSuccess" class="text-green-700 text-xs mt-1">{{ twoFaSuccess }}</p>
        </div>

        <!-- Смена пароля -->
        <div class="bg-gray-100 border border-gray-400 p-3 mb-3 text-sm">
          <h2 class="font-bold text-blue-900 mb-2">Сменить пароль</h2>

          <template v-if="!pwFormVisible">
            <button
              @click="pwFormVisible = true"
              class="px-3 py-1 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-xs font-bold"
            >
              Сменить пароль
            </button>
          </template>

          <template v-else>
            <div class="relative mb-2">
              <input
                v-model="pwOldPassword"
                :type="showPwOld ? 'text' : 'password'"
                placeholder="Текущий пароль"
                class="w-full px-2 py-1 border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] bg-white text-xs outline-none pr-8"
              />
              <button
                @click="showPwOld = !showPwOld"
                type="button"
                class="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 px-1 outline-none"
              >
                {{ showPwOld ? '🙈' : '👁' }}
              </button>
            </div>
            <div class="relative mb-2">
              <input
                v-model="pwNewPassword"
                :type="showPwNew ? 'text' : 'password'"
                placeholder="Новый пароль (8-20 символов)"
                class="w-full px-2 py-1 border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] bg-white text-xs outline-none pr-8"
              />
              <button
                @click="showPwNew = !showPwNew"
                type="button"
                class="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 px-1 outline-none"
              >
                {{ showPwNew ? '🙈' : '👁' }}
              </button>
            </div>
            <div class="relative mb-2">
              <input
                v-model="pwConfirmPassword"
                :type="showPwConfirm ? 'text' : 'password'"
                placeholder="Повторите новый пароль"
                class="w-full px-2 py-1 border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] bg-white text-xs outline-none pr-8"
              />
              <button
                @click="showPwConfirm = !showPwConfirm"
                type="button"
                class="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 px-1 outline-none"
              >
                {{ showPwConfirm ? '🙈' : '👁' }}
              </button>
            </div>
            <div class="flex gap-2">
              <button
                @click="cancelPwChange"
                class="px-3 py-1 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-xs font-bold"
              >
                Отмена
              </button>
              <button
                @click="confirmPwChange"
                :disabled="pwLoading || !pwNewPassword.trim() || !pwOldPassword.trim()"
                class="px-3 py-1 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-xs font-bold disabled:opacity-50"
              >
                {{ pwLoading ? '...' : 'Сохранить' }}
              </button>
            </div>
          </template>

          <p v-if="pwError" class="text-red-600 text-xs mt-1">{{ pwError }}</p>
          <p v-if="pwSuccess" class="text-green-700 text-xs mt-1">{{ pwSuccess }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '../api/client'

const emit = defineEmits(['close', 'username-changed'])

const profile = ref({})
const loading = ref(true)
const error = ref(null)

const newUsername = ref('')
const usernameError = ref('')
const usernameSuccess = ref('')

const twoFaStep = ref(null)
const twoFaCode = ref('')
const twoFaLoading = ref(false)
const twoFaError = ref('')
const twoFaSuccess = ref('')

const pwFormVisible = ref(false)
const pwOldPassword = ref('')
const pwNewPassword = ref('')
const pwConfirmPassword = ref('')
const pwLoading = ref(false)
const pwError = ref('')
const pwSuccess = ref('')
const showPwOld = ref(false)
const showPwNew = ref(false)
const showPwConfirm = ref(false)

const formatPct = (v) => {
  if (v == null) return '—'
  return Math.round(v) + '%'
}

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ru-RU', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

const loadProfile = async () => {
  try {
    const data = await apiClient.getProfile()
    profile.value = data
  } catch (e) {
    error.value = e.message || 'Ошибка загрузки профиля'
  } finally {
    loading.value = false
  }
}

const changeUsername = async () => {
  usernameError.value = ''
  usernameSuccess.value = ''
  const name = newUsername.value.trim()
  if (name.length < 4 || name.length > 16) {
    usernameError.value = 'Никнейм должен быть от 4 до 16 символов'
    return
  }
  try {
    await apiClient.updateProfile(name)
    profile.value.username = name
    localStorage.setItem('username', name)
    emit('username-changed', name)
    usernameSuccess.value = 'Никнейм изменён'
    newUsername.value = ''
  } catch (e) {
    usernameError.value = e.message || 'Ошибка'
  }
}

const start2FASetup = async () => {
  twoFaLoading.value = true
  twoFaError.value = ''
  twoFaSuccess.value = ''
  try {
    await apiClient.setup2FA()
    twoFaStep.value = 'code'
    twoFaSuccess.value = 'Код отправлен на email'
  } catch (e) {
    const msg = e.message || ''
    if (msg.includes('уже отправлен')) {
      twoFaStep.value = 'code'
      twoFaSuccess.value = 'Код уже был отправлен. Проверьте почту (и папку спам).'
    } else {
      twoFaError.value = msg || 'Ошибка'
    }
  } finally {
    twoFaLoading.value = false
  }
}

const confirm2FASetup = async () => {
  twoFaLoading.value = true
  twoFaError.value = ''
  twoFaSuccess.value = ''
  try {
    await apiClient.verify2FASetup(twoFaCode.value.trim())
    profile.value.otp_enabled = true
    twoFaStep.value = null
    twoFaCode.value = ''
    twoFaSuccess.value = '2FA включена'
  } catch (e) {
    twoFaError.value = e.message || 'Ошибка'
  } finally {
    twoFaLoading.value = false
  }
}

const disable2FA = async () => {
  twoFaLoading.value = true
  twoFaError.value = ''
  twoFaSuccess.value = ''
  try {
    await apiClient.disable2FA()
    profile.value.otp_enabled = false
    twoFaSuccess.value = '2FA отключена'
  } catch (e) {
    twoFaError.value = e.message || 'Ошибка'
  } finally {
    twoFaLoading.value = false
  }
}

const confirmPwChange = async () => {
  pwLoading.value = true
  pwError.value = ''
  pwSuccess.value = ''

  if (pwNewPassword.value !== pwConfirmPassword.value) {
    pwError.value = 'Пароли не совпадают'
    pwLoading.value = false
    return
  }

  try {
    await apiClient.updatePassword(pwOldPassword.value, pwNewPassword.value)
    pwSuccess.value = 'Пароль изменён'
    pwFormVisible.value = false
    pwOldPassword.value = ''
    pwNewPassword.value = ''
    pwConfirmPassword.value = ''
  } catch (e) {
    pwError.value = e.message || 'Ошибка'
  } finally {
    pwLoading.value = false
  }
}

const cancelPwChange = () => {
  pwFormVisible.value = false
  pwOldPassword.value = ''
  pwNewPassword.value = ''
  pwConfirmPassword.value = ''
  pwError.value = ''
  pwSuccess.value = ''
}

onMounted(loadProfile)
</script>
