<template>
  <div class="upload-page container section-padding animate-fade-in">
    <div class="upload-container glass-panel">
      <h1 class="font-logo title">{{ $t('upload_game') }}</h1>

      <form @submit.prevent="handleUpload" class="upload-form">
        <div class="form-group">
          <label for="distributor-options">{{ $t('fetch_distributor') }}</label>
          <select name="distributor" class="form-control" id="distributor-options" v-model="distributor">
            <option value="" disabled="" selected="" hidden="">{{ $t('choose_distributor') }}</option>
            <option value="#gamemonetize">GameMonetize</option>
            <option value="#gamepix">GamePix</option>
            <option value="#4j">4J</option>
            <option value="#wanted5games">Wanted5Games</option>
            <option value="#gamearter">GameArter</option>
            <option value="#gameflare">Gameflare</option>
            <option value="#y8">Y8</option>
            <option value="#gamezop">Gamezop</option>
            <option value="#htmlgames">HTMLGAMES</option>
            <option value="#famobi">Famobi</option>
          </select>
        </div>

        <div class="form-group">
          <label for="game-file">{{ $t('upload_html5') }}</label>
          <input type="file" id="game-file" accept=".zip,.html" class="form-control file-input" @change="handleFileChange">
        </div>

        <div class="form-group">
          <label for="remote-url">{{ $t('remote_upload') }}</label>
          <input type="url" id="remote-url" v-model="remoteUrl" placeholder="https://example.com/game" class="form-control">
        </div>

        <div class="form-group">
          <label for="json-file">{{ $t('json_importer') }}</label>
          <input type="file" id="json-file" accept=".json" class="form-control file-input" @change="handleJsonChange">
        </div>

        <button type="submit" class="btn-primary upload-btn" :disabled="uploading">
          {{ uploading ? $t('uploading') : $t('upload') }}
        </button>

        <div v-if="message" :class="['message', isError ? 'error-msg' : 'success-msg']">
          {{ message }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const distributor = ref('')
const file = ref(null)
const jsonFile = ref(null)
const remoteUrl = ref('')
const uploading = ref(false)
const message = ref('')
const isError = ref(false)

const handleFileChange = (e) => {
  if (e.target.files && e.target.files.length > 0) {
    file.value = e.target.files[0]
  }
}

const handleJsonChange = (e) => {
  if (e.target.files && e.target.files.length > 0) {
    jsonFile.value = e.target.files[0]
  }
}

const handleUpload = async () => {
  uploading.value = true
  message.value = ''
  isError.value = false

  try {
    const formData = new FormData()
    if (distributor.value) {
      formData.append('distributor', distributor.value)
    }

    if (file.value) {
      formData.append('gameFile', file.value)
    }

    if (jsonFile.value) {
      formData.append('jsonFile', jsonFile.value)
    }

    if (remoteUrl.value) {
      formData.append('remoteUrl', remoteUrl.value)
    }

    // Fallback if they didn't pick any option
    if (!file.value && !distributor.value && !jsonFile.value && !remoteUrl.value) {
      // Create a dummy blob to test API endpoint that requires formData
      formData.append('dummy', 'dummy')
    }

    const response = await $fetch('/api/games/upload', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      message.value = response.message || 'Game uploaded successfully'
      isError.value = false
    }
  } catch (err) {
    message.value = err.data?.statusMessage || err.message || 'Error uploading game'
    isError.value = true
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.upload-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.upload-container {
  width: 100%;
  max-width: 600px;
  padding: 3rem;
  border-radius: 12px;
  background: var(--bg-secondary);
}

.title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: var(--text-primary);
}

.form-control {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: var(--accent);
}

.file-input {
  cursor: pointer;
}

.upload-btn {
  background: var(--accent);
  color: #000000;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.1rem;
  margin-top: 1rem;
  transition: var(--transition-smooth);
}

.upload-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.upload-btn:disabled {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  cursor: not-allowed;
}

.message {
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
}

.success-msg {
  background: #ffffff;
  color: #000000;
  border: 1px solid #000000;
}

.error-msg {
  background: #000000;
  color: #ffffff;
  border: 1px solid #ffffff;
}
</style>