<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  try {
    await authStore.login(email.value, password.value)
    router.push({ name: 'dashboard' })
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Неверный email или пароль'
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-icon">🎤</div>
        <h1>Ruslan Admin</h1>
        <p>Войдите в панель управления</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

        <button type="submit" class="login-btn" :disabled="authStore.loading">
          {{ authStore.loading ? 'Вход...' : 'Войти' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #0f0f0f;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Inter', system-ui, sans-serif;
}

.login-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 380px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.login-header h1 {
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
}

.login-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #9a9a9a;
}

.form-group input {
  background: #252525;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 10px 14px;
  color: #e0e0e0;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}

.form-group input:focus {
  border-color: #555;
}

.form-group input::placeholder {
  color: #444;
}

.error-msg {
  background: rgba(192, 57, 43, 0.15);
  border: 1px solid rgba(192, 57, 43, 0.4);
  border-radius: 6px;
  padding: 10px 14px;
  color: #e74c3c;
  font-size: 13px;
}

.login-btn {
  background: #fff;
  color: #0f0f0f;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 767px) {
  .login-card {
    padding: 32px 20px;
    border-radius: 16px;
    border: none;
    background: #161616;
  }
}
</style>
