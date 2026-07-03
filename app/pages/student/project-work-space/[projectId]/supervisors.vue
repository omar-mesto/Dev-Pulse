<script setup lang="ts">
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

// ─── Types ───
interface Supervisor {
  id: number
  name: string
  email: string
  academic_title: string
  specialization: string
}

interface SupervisorMatch {
  supervisor: Supervisor
  matched_interests: string[]
  missing_interests: string[]
  match_percentage: number
}

interface SupervisorMatchResponse {
  status: boolean
  message: string
  data: {
    data: SupervisorMatch[]
    meta: {
      current_page: number
      last_page: number
      per_page: number
      total: number
    }
  }
}

interface SubmitProposalResponse {
  status: boolean
  message: string
  data: {
    proposal: {
      id: number
      status: string
      supervisor: string
      [key: string]: any
    }
  }
}

// ─── Setup ───
const route = useRoute()
const router = useRouter()
const api = useApiClient()
const appToast = useAppToast()
const queryClient = useQueryClient()

const projectId = computed(() => {
  const id = route.params.id
  
return id ? Number(id) : 0
})

// ─── Load proposalId from localStorage ───
const proposalId = ref<number | null>(null)

const loadProposalId = () => {
  if (import.meta.client) {
    const saved = localStorage.getItem(`proposal-id-for-project-${projectId.value}`)
    if (saved) proposalId.value = Number(saved)
  }
}

loadProposalId()

// ─── Fetch Project Details for title ───
const { data: projectData } = useQuery({
  queryKey: ['project-detail', projectId],
  queryFn: () => api.request(`/project-ideas/${projectId.value}`),
  enabled: () => projectId.value > 0,
})

const projectTitle = computed(() => projectData.value?.data?.project_idea?.title || 'Loading...')

// ─── Fetch Matching Supervisors ───
const { data: matchesData, isLoading: isLoadingMatches } = useQuery<SupervisorMatchResponse>({
  queryKey: ['supervisor-matches', projectId],
  queryFn: () => api.request<SupervisorMatchResponse>(`/project-ideas/${projectId.value}/matching/supervisors`),
  enabled: () => projectId.value > 0,
})

const supervisors = computed(() => matchesData.value?.data?.data || [])

// ─── Submit Proposal to Supervisor Mutation ───
const { mutate: submitToSupervisor, isPending: isSubmitting } = useMutation<
  SubmitProposalResponse,
  Error,
  number
>({
  mutationFn: async (supervisorId: number) => {
    return await api.request<SubmitProposalResponse>(`/project-proposals/${proposalId.value}/submit`, {
      method: 'POST',
      body: { supervisor_id: supervisorId },
    })
  },
  onSuccess: (res) => {
    appToast.success('Success', res.message || 'Proposal submitted to supervisor successfully')
    // Invalidate proposal query to refresh data
    queryClient.invalidateQueries({ queryKey: ['project-proposal'] })
    // Go back to project workspace
    router.push(`/student/project-work-space/${projectId.value}`)
  },
  onError: (err) => {
    appToast.error('Error', err.message || 'Failed to submit proposal to supervisor')
  }
})

// ─── Handle supervisor selection ───
const selectedSupervisor = ref<number | null>(null)

const handleSelectSupervisor = (supervisorId: number) => {
  if (!proposalId.value) {
    appToast.error('Error', 'Please save your proposal first')
    
return
  }
  selectedSupervisor.value = supervisorId
  submitToSupervisor(supervisorId)
}

// ─── Navigation ───
const goBack = () => {
  router.push(`/student/project-work-space/${projectId.value}`)
}

// ─── Get match color based on percentage ───
const getMatchColor = (percentage: number) => {
  if (percentage >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  if (percentage >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  
return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
}

const getMatchBarColor = (percentage: number) => {
  if (percentage >= 80) return 'bg-emerald-500'
  if (percentage >= 50) return 'bg-amber-500'
  
return 'bg-slate-500'
}
</script>

<template>
  <div class="min-h-screen bg-brand-dark text-slate-100 font-sans antialiased flex">
    <!-- Sidebar -->
    <aside class="w-56 bg-brand-deep border-r border-border-dark flex flex-col py-4 px-3 gap-1 fixed h-full z-20">
      <div class="flex items-center gap-2 px-2 mb-6">
        <div class="h-7 w-7 rounded-md bg-brand-purple flex items-center justify-center">
          <UIcon name="i-heroicons-bolt" class="h-4 w-4 text-white" />
        </div>
        <span class="text-sm font-semibold text-white">DevPulse</span>
      </div>

      <nav class="flex flex-col gap-1 flex-1">
        <button
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-panel-dark transition-colors text-left"
          @click="goBack"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-5 w-5 text-slate-500" />
          <p class="text-sm">Back to Project</p>
        </button>
      </nav>

      <div class="border-t border-border-dark pt-3 mt-auto flex flex-col gap-1">
        <div class="flex items-center gap-2 px-2 pt-3 mt-1 border-t border-border-dark">
          <div class="h-7 w-7 rounded-full bg-brand-purple flex items-center justify-center text-xs font-semibold">
            A
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-white font-medium leading-tight">Alex Chen</span>
            <span class="text-[10px] text-slate-500">Student</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 ml-56 flex flex-col min-h-screen">
      <!-- Header -->
      <header class="h-14 border-b border-border-dark px-6 flex items-center justify-between bg-brand-deep sticky top-0 z-10">
        <div class="flex items-center gap-3">
          <button
            class="text-slate-400 hover:text-white transition-colors"
            @click="goBack"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-sm font-bold text-white">Find a Supervisor</h1>
            <p class="text-[11px] text-slate-500">{{ projectTitle }}</p>
          </div>
        </div>
      </header>

      <!-- Content -->
      <div class="flex-1 p-8 overflow-y-auto">
        <div class="max-w-4xl mx-auto">
          <!-- Page Title -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-white mb-2">Matching Supervisors</h2>
            <p class="text-sm text-slate-400">
              Based on your project's required skills, we found these supervisors that match your interests.
            </p>
          </div>

          <!-- Loading State -->
          <div v-if="isLoadingMatches" class="flex items-center justify-center py-12">
            <UIcon name="i-heroicons-arrow-path" class="h-6 w-6 animate-spin text-brand-purple" />
            <span class="ml-2 text-sm text-slate-400">Finding matching supervisors...</span>
          </div>

          <!-- No Results -->
          <div v-else-if="supervisors.length === 0" class="text-center py-12">
            <UIcon name="i-heroicons-user-group" class="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-white mb-2">No matching supervisors found</h3>
            <p class="text-sm text-slate-400">Try updating your project's required skills to find better matches.</p>
          </div>

          <!-- Supervisors List -->
          <div v-else class="space-y-4">
            <div
              v-for="match in supervisors"
              :key="match.supervisor.id"
              class="bg-panel-dark border border-border-dark rounded-xl p-6 hover:border-brand-purple/30 transition-all"
            >
              <div class="flex items-start justify-between">
                <!-- Supervisor Info -->
                <div class="flex items-start gap-4">
                  <!-- Avatar -->
                  <div class="h-12 w-12 rounded-full bg-brand-purple/20 flex items-center justify-center flex-shrink-0">
                    <span class="text-lg font-bold text-brand-purple">
                      {{ match.supervisor.name.charAt(0) }}
                    </span>
                  </div>

                  <!-- Details -->
                  <div>
                    <h3 class="text-base font-semibold text-white mb-1">
                      {{ match.supervisor.name }}
                    </h3>
                    <p class="text-xs text-slate-400 mb-1">
                      {{ match.supervisor.academic_title }} • {{ match.supervisor.specialization }}
                    </p>
                    <p class="text-xs text-slate-500">
                      {{ match.supervisor.email }}
                    </p>

                    <!-- Matched Interests -->
                    <div class="flex flex-wrap gap-1.5 mt-3">
                      <span
                        v-for="interest in match.matched_interests"
                        :key="interest"
                        class="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      >
                        {{ interest }}
                      </span>
                      <span
                        v-for="interest in match.missing_interests"
                        :key="interest"
                        class="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-500/10 text-slate-500 border border-slate-700/50"
                      >
                        {{ interest }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Match Percentage & Action -->
                <div class="flex flex-col items-end gap-3">
                  <!-- Match Badge -->
                  <div
                    class="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                    :class="getMatchColor(match.match_percentage)"
                  >
                    <UIcon name="i-heroicons-check-circle" class="h-4 w-4" />
                    <span class="text-xs font-bold">{{ match.match_percentage }}% Match</span>
                  </div>

                  <!-- Match Bar -->
                  <div class="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="getMatchBarColor(match.match_percentage)"
                      :style="{ width: `${match.match_percentage}%` }"
                    />
                  </div>

                  <!-- Select Button -->
                  <button
                    class="flex items-center gap-1.5 bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    :disabled="isSubmitting && selectedSupervisor === match.supervisor.id"
                    @click="handleSelectSupervisor(match.supervisor.id)"
                  >
                    <UIcon
                      v-if="isSubmitting && selectedSupervisor === match.supervisor.id"
                      name="i-heroicons-arrow-path"
                      class="h-3.5 w-3.5 animate-spin"
                    />
                    <UIcon v-else name="i-heroicons-paper-airplane" class="h-3.5 w-3.5" />
                    {{ isSubmitting && selectedSupervisor === match.supervisor.id ? 'Sending...' : 'Send Request' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>