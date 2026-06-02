<script setup lang="ts">
const authStore = useAuthStore()

if (!authStore.isAuthenticated) {
  await navigateTo('/auth/login')
}
</script>

<template>
  <div class="p-8 flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <UCard class="w-full max-w-xl text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to Dev Pulse Dashboard 
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        The system and ultimate software architecture are now running at peak performance and efficiency.
      </p>
      <UButton 
        color="error" 
        variant="soft" 
        icon="i-heroicons-arrow-left-on-rectangle" 
        @click="authStore.logout()"
      >
        Log Out
      </UButton>
    </UCard>
  </div>
</template>