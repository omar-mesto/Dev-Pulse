<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MatchesResponse, Match, InvitationPayload, InvitationResponse, InvitationsListResponse } from '~/types/project'

const route = useRoute()
const router = useRouter()
const api = useApiClient()
const appToast = useAppToast()
const queryClient = useQueryClient()

const projectId = computed(() => Number(route.params.projectId))
const searchQuery = ref('')
const activeFilter = ref<string | null>(null)

const filterTabs = ['Front-end', 'Back-end', 'Mobile', 'UI/UX Design', 'Data Science', 'DevOps']

const { data: matchesData, isLoading: isLoadingMatches } = useQuery<MatchesResponse>({
  queryKey: ['matches', projectId],
  queryFn: () => api.request<MatchesResponse>(`/project-ideas/${projectId.value}/matching/students`),
  enabled: () => !!projectId.value,
})

const { data: invitationsData } = useQuery<InvitationsListResponse>({
  queryKey: ['my-invitations'],
  queryFn: () => api.request<InvitationsListResponse>('/my-invitations'),
})

const sentInvitationReceiverIds = computed<Set<number>>(() => {
  const invitations = invitationsData.value?.data?.invitations ?? []
  
return new Set(
    invitations
      .filter(inv => inv.project_idea_id === projectId.value)
      .map(inv => inv.receiver_id)
  )
})

const matches = computed<Match[]>(() => matchesData.value?.data?.matches ?? [])

const filteredMatches = computed<Match[]>(() => {
  let list = matches.value

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(m =>
      m.student.name.toLowerCase().includes(q) ||
      m.student.email.toLowerCase().includes(q) ||
      m.matched_skills.some(s => s.toLowerCase().includes(q))
    )
  }

  if (activeFilter.value) {
    const f = activeFilter.value.toLowerCase()
    list = list.filter(m =>
      m.matched_skills.some(s => s.toLowerCase().includes(f)) ||
      m.missing_skills.some(s => s.toLowerCase().includes(f))
    )
  }

  return list
})

const pendingInvitations = ref<Set<number>>(new Set())

const { mutate: sendInvitation } = useMutation<InvitationResponse, Error, InvitationPayload>({
  mutationFn: (payload) =>
    api.request<InvitationResponse>(`/project-ideas/${projectId.value}/invitations`, {
      method: 'POST',
      body: payload,
    }),
  onMutate: (payload) => {
    pendingInvitations.value.add(payload.receiver_id)
  },
  onSuccess: (res) => {
    const receiverId = res.data.invitation.receiver_id
    pendingInvitations.value.delete(receiverId)
    appToast.success('Invitation sent', 'The student has been invited to your project.')
    queryClient.invalidateQueries({ queryKey: ['my-invitations'] })
  },
  onError: (_err, payload) => {
    pendingInvitations.value.delete(payload.receiver_id)
    appToast.error('Error', 'Failed to send invitation. Please try again.')
  },
})

const isInvited = (studentId: number): boolean =>
  sentInvitationReceiverIds.value.has(studentId)

const isSending = (studentId: number): boolean =>
  pendingInvitations.value.has(studentId)

const getInitials = (name: string | undefined): string => {
  if (!name) return '??';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getMatchColor = (pct: number): string => {
  if (pct >= 70) return 'text-emerald-400'
  if (pct >= 40) return 'text-amber-400'
  
return 'text-slate-400'
}

const getMatchBg = (pct: number): string => {
  if (pct >= 70) return 'bg-emerald-500'
  if (pct >= 40) return 'bg-amber-500'
  
return 'bg-slate-600'
}

const toggleFilter = (filter: string) => {
  activeFilter.value = activeFilter.value === filter ? null : filter
}

const goToWorkspace = () => {
  router.push(`/student/project-work-space/${projectId.value}`)
}
</script>

<template>
  <div class="min-h-screen bg-brand-bg text-white font-sans flex">
    <aside class="w-44 bg-brand-deep border-r border-border-dark flex flex-col py-4 px-3 gap-1 fixed h-full">
      <div class="flex items-center gap-2 px-2 mb-6">
        <div class="h-7 w-7 rounded-md bg-brand-purple flex items-center justify-center">
          <UIcon name="i-heroicons-bolt" class="h-4 w-4 text-white" />
        </div>
        <span class="text-sm font-semibold text-white">DevPulse</span>
      </div>

      <nav class="flex flex-col gap-1 flex-1">
        <button
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white bg-panel-dark transition-colors text-left"
        >
          <UIcon name="i-heroicons-user-group" class="h-6 w-6 text-brand-purple" />
          <p class="">Team Builder</p>
        </button>
      </nav>

      <div class="border-t border-border-dark pt-3 mt-auto flex flex-col gap-1">
        <button
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-panel-dark transition-colors text-left"
        >
          <UIcon name="i-heroicons-cog-6-tooth" class="h-4 w-4" />
          Settings
        </button>
        <button
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-panel-dark transition-colors text-left"
        >
          <UIcon name="i-heroicons-arrow-right-on-rectangle" class="h-4 w-4" />
          Log out
        </button>

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

    <main class="flex-1 ml-44 flex flex-col">
      <header class="h-14 border-b border-border-dark px-6 flex items-center justify-between bg-brand-deep sticky top-0 z-10">
        <div class="flex items-center gap-3">
          <button
            class="text-slate-400 hover:text-white transition-colors"
            @click="router.back()"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          </button>

          <div>
            <h1 class="text-sm font-bold text-white">Team Builder</h1>
            <p class="text-[11px] text-slate-500">Find teammates based on skill gaps</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
            <div class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span class="text-xs text-emerald-400 font-medium">
              {{ matches.length }} available
            </span>
          </div>

          <button
            class="flex items-center gap-2 bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            @click="goToWorkspace"
          >
            <UIcon name="i-heroicons-arrow-right" class="h-3.5 w-3.5" />
            Go to Workspace
          </button>
        </div>
      </header>

      <div class="p-6 flex flex-col gap-5 flex-1">
        <div class="flex gap-3">
          <div class="relative flex-1">
            <UIcon
              name="i-heroicons-magnifying-glass"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name, role, or skills..."
              class="w-full bg-panel-dark border border-border-dark rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-purple transition-colors"
            >
          </div>
        </div>

        <div class="bg-panel-dark border border-border-dark rounded-xl p-4">
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="i-heroicons-sparkles" class="h-4 w-4 text-brand-purple" />
            <span class="text-xs font-medium text-slate-300">I'm looking for teammates with skills in...</span>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="filter in filterTabs"
              :key="filter"
              class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              :class="
                activeFilter === filter
                  ? 'bg-brand-purple border-brand-purple text-white'
                  : 'bg-panel-dark border-border-dark text-slate-400 hover:text-white hover:border-slate-500'
              "
              @click="toggleFilter(filter)"
            >
              {{ filter }}
            </button>
          </div>
        </div>

        <div v-if="isLoadingMatches" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="i in 4"
            :key="i"
            class="bg-panel-dark border border-border-dark rounded-xl p-5 animate-pulse h-48"
          />
        </div>

        <div v-else-if="filteredMatches.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="h-12 w-12 rounded-full bg-panel-dark border border-border-dark flex items-center justify-center mb-3">
            <UIcon name="i-heroicons-user-group" class="h-6 w-6 text-slate-500" />
          </div>
          <p class="text-sm font-medium text-slate-300">No students found</p>
          <p class="text-xs text-slate-500 mt-1">Try adjusting your search or filters</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="match in filteredMatches"
            :key="match.student.id"
            class="bg-panel-dark border border-border-dark rounded-xl p-5 flex flex-col gap-4 hover:border-slate-600 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="relative">
                  <div
                    class="h-10 w-10 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-sm font-bold text-brand-purple"
                  >
                    {{ getInitials(match.student.name) }}
                  </div>
                  <div
                    v-if="match.match_percentage >= 60"
                    class="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-panel-dark"
                  />
                </div>

                <div>
                  <p class="text-sm font-semibold text-white leading-tight">{{ match.student.name }}</p>
                  <p class="text-xs text-slate-500 mt-0.5">{{ match.student.email }}</p>
                </div>
              </div>

              <div class="flex items-center gap-1.5">
                <UIcon name="i-heroicons-bolt" class="h-3.5 w-3.5" :class="getMatchColor(match.match_percentage)" />
                <span class="text-sm font-bold" :class="getMatchColor(match.match_percentage)">
                  {{ match.match_percentage }}%
                </span>
                <span class="text-xs text-slate-500">match</span>
              </div>
            </div>

            <div class="w-full h-1 rounded-full bg-border-dark overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="getMatchBg(match.match_percentage)"
                :style="{ width: `${match.match_percentage}%` }"
              />
            </div>

            <div class="flex flex-col gap-2">
              <div v-if="match.matched_skills.length">
                <p class="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Matched Skills</p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="skill in match.matched_skills"
                    :key="skill"
                    class="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-xs"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>

              <div v-if="match.missing_skills.length">
                <p class="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Missing Skills</p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="skill in match.missing_skills"
                    :key="skill"
                    class="px-2 py-0.5 bg-slate-700/50 border border-border-dark text-slate-400 rounded text-xs"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex gap-2 mt-auto pt-2 border-t border-border-dark">
              <button
                class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center"
                :class="
                  isInvited(match.student.id)
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                    : isSending(match.student.id)
                    ? 'bg-brand-purple/50 text-white/60 cursor-not-allowed'
                    : 'bg-brand-purple hover:bg-brand-purple-hover text-white cursor-pointer'
                "
                :disabled="isInvited(match.student.id) || isSending(match.student.id)"
                @click="!isInvited(match.student.id) && !isSending(match.student.id) && sendInvitation({ receiver_id: match.student.id })"
              >
                <UIcon
                  v-if="isSending(match.student.id)"
                  name="i-heroicons-arrow-path"
                  class="h-3.5 w-3.5 animate-spin"
                />
                <UIcon
                  v-else-if="isInvited(match.student.id)"
                  name="i-heroicons-check"
                  class="h-3.5 w-3.5"
                />
                <UIcon
                  v-else
                  name="i-heroicons-paper-airplane"
                  class="h-3.5 w-3.5"
                />
                <span>
                  {{ isSending(match.student.id) ? 'Sending...' : isInvited(match.student.id) ? 'Invited' : 'Connect' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>