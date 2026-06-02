<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'

definePageMeta({
  layout: 'blank'
})

const route = useRoute()
const authStore = useAuthStore()
const authService = useAuthService()
const appToast = useAppToast()

const showRoleSelection = ref(false)
const selectedRole = ref<string | null>(null)
const codeParam = computed(() => (route.query.code as string) || '')

const { mutate: executeSocialAuth, isPending } = useMutation({
  mutationFn: async (roleValue?: string) => {
    return await authService.verifyGoogleCallback(codeParam.value, roleValue)
  },
  onSuccess: async (response) => {
    if (response?.status && response.data) {
      authStore.setAuth({
        token: response.data.token,
        user: response.data.user,
        role: response.data.role
      })

      appToast.success('Welcome to DevPulse!', `Logged in successfully as ${response.data.user.name}`)

      if (response.data.profile_completed === false) {
        // await navigateTo('/profile/setup')
      } else {
        await navigateTo('/')
      }
    }
  },
  onError: (error: unknown) => {
    const fetchError = error as { data?: { status: boolean; errors?: { role?: string[] } } }
    const errorData = fetchError.data

    if (errorData && errorData.status === false && errorData.errors?.role) {
      showRoleSelection.value = true
      appToast.warning('Role Required', 'Please select your role to complete your registration.')
    } else {
      console.error(error)
      appToast.error('Authentication Failed', 'An error occurred during verification.')
      navigateTo('/auth/login')
    }
  }
})

if (import.meta.client) {
  if (codeParam.value) {
    executeSocialAuth(undefined)
  } else {
    navigateTo('/auth/login')
  }
}

const handleRoleSubmit = () => {
  if (!selectedRole.value) {
    appToast.error('Selection Missing', 'Please select a role.')
    
return
  }
  showRoleSelection.value = false
  executeSocialAuth(selectedRole.value)
}
</script>

<template>
  <div class="min-h-screen bg-brand-deep flex items-center justify-center text-white font-sans antialiased">
    
    <div v-if="isPending" class="w-full max-w-md text-center space-y-6 p-8 rounded-xl border border-border-dark bg-brand-dark">
      <div class="h-12 w-12 rounded-full border-4 border-t-brand-purple border-input-border animate-spin mx-auto"/>
      <p class="text-xs text-slate-400 animate-pulse">Securing your session and verifying credentials...</p>
    </div>

    <div v-else-if="showRoleSelection" class="w-full max-w-lg p-8 rounded-xl border border-border-dark bg-brand-dark shadow-2xl space-y-6">
      <div class="text-center space-y-2">
        <h3 class="text-xl font-bold text-white tracking-tight">Complete Your Profile</h3>
        <p class="text-xs text-slate-400">Select your academic role before continuing registration via Google</p>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <button 
          type="button"
          :class="['p-4 rounded-lg border text-center transition-all cursor-pointer space-y-2', selectedRole === 'student' ? 'border-brand-purple bg-[#121833]' : 'border-border-slate bg-panel-dark hover:border-slate-700']"
          @click="selectedRole = 'student'"
        >
          <UIcon name="i-heroicons-academic-cap" class="h-6 w-6 mx-auto text-blue-400" />
          <div class="text-xs font-semibold">Student</div>
        </button>

        <button 
          type="button"
          :class="['p-4 rounded-lg border text-center transition-all cursor-pointer space-y-2', selectedRole === 'supervisor' ? 'border-brand-purple bg-[#121833]' : 'border-border-slate bg-panel-dark hover:border-slate-700']"
          @click="selectedRole = 'supervisor'"
        >
          <UIcon name="i-heroicons-user" class="h-6 w-6 mx-auto text-emerald-400" />
          <div class="text-xs font-semibold">Supervisor</div>
        </button>

        <button 
          type="button"
          :class="['p-4 rounded-lg border text-center transition-all cursor-pointer space-y-2', selectedRole === 'committee-member' ? 'border-brand-purple bg-[#121833]' : 'border-border-slate bg-panel-dark hover:border-slate-700']"
          @click="selectedRole = 'committee-member'"
        >
          <UIcon name="i-heroicons-shield-check" class="h-6 w-6 mx-auto text-purple-400" />
          <div class="text-xs font-semibold">Committee</div>
        </button>
      </div>

      <UButton 
        block
        size="lg"
        label="Confirm & Create Account"
        class="bg-brand-purple hover:bg-brand-purple-hover font-semibold text-sm transition-colors cursor-pointer"
        @click="handleRoleSubmit"
      />
    </div>
  </div>
</template>