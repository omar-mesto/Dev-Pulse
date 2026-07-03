<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import type { SingleProjectResponse, ProjectIdea } from '~/types/project'

const route = useRoute()
const router = useRouter()
const api = useApiClient()

const projectId = computed(() => Number(route.params.projectId))

// ─── Fetch Single Project from Real API ───
const { data: projectData, isLoading: isLoadingProject } = useQuery<SingleProjectResponse>({
  queryKey: ['project-detail', projectId],
  queryFn: () => api.request<SingleProjectResponse>(`/project-ideas/${projectId.value}`),
  enabled: () => !!projectId.value,
})

const project = computed<ProjectIdea | null>(() => projectData.value?.data?.project_idea ?? null)

// ─── Mock: Team data for this project (will be replaced when team API is available) ───
// TODO: Replace with real API call when available
const team = ref({
  id: 3,
  status: 'forming',
  members: [
    {
      id: 1,
      name: 'Ali Student',
      email: 'student1@devpulse.test',
      role: 'leader',
      profile: {
        full_name: 'Ali Student',
        university_id: 'STU-2026-001',
        department: 'Software Engineering',
        academic_year: '5',
        skills: ['Laravel', 'Vue.js', 'MySQL'],
        bio: 'Student interested in building DevPulse backend APIs'
      }
    }
  ]
})

// ─── Computed: Check if team is complete ───
const isTeamComplete = computed(() => {
  if (!project.value) return false
  
return team.value.members.length >= project.value.team_size
})

// ─── Helpers ───
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  
return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  published:      { label: 'Published',      color: 'text-emerald-400',  bg: 'bg-emerald-500/10',  dot: 'bg-emerald-400' },
  forming:        { label: 'Forming',        color: 'text-amber-400',    bg: 'bg-amber-500/10',    dot: 'bg-amber-400' },
  team_completed: { label: 'Team Ready',     color: 'text-blue-400',     bg: 'bg-blue-500/10',     dot: 'bg-blue-400' },
  draft:          { label: 'Draft',          color: 'text-slate-400',    bg: 'bg-slate-500/10',    dot: 'bg-slate-400' }
}

const memberRoleConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  leader: { label: 'Leader', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: 'i-heroicons-star' },
  member: { label: 'Member', color: 'text-blue-400',   bg: 'bg-blue-500/10',   icon: 'i-heroicons-user' }
}

const skillColors: Record<string, string> = {
  laravel: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'vue.js': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  vue: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  mysql: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'machine learning': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  tailwind: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  typescript: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
}

const getSkillClasses = (skill: string) => {
  return skillColors[skill.toLowerCase()] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

const goToTeamBuilder = () => {
  router.push(`/student/team-builder/${projectId.value}`)
}

const goToKanban = () => {
  router.push(`/student/project-work-space/${projectId.value}/kanban`)
}

const goToProposal = () => {
  router.push(`/student/project-work-space/${projectId.value}/proposal`)
}
</script>

<template>
  <div class="min-h-screen bg-brand-dark text-slate-100 font-sans antialiased">
    <!-- Top Navigation -->
    <nav class="sticky top-0 z-50 border-b border-slate-800 bg-brand-dark/80 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20">
              <UIcon name="i-heroicons-bolt" class="h-4 w-4" />
            </div>
            <span class="text-lg font-bold tracking-tight text-white">DevPulse</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-400 hidden sm:inline">Ali Student</span>
            <div class="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              AS
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div v-if="isLoadingProject" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="animate-pulse space-y-6">
        <div class="h-8 bg-slate-800 rounded w-1/3" />
        <div class="h-4 bg-slate-800 rounded w-1/2" />
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-4">
            <div class="h-64 bg-slate-800 rounded-xl" />
            <div class="h-48 bg-slate-800 rounded-xl" />
          </div>
          <div class="space-y-4">
            <div class="h-48 bg-slate-800 rounded-xl" />
            <div class="h-48 bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="project" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <NuxtLink to="/student/my-projects" class="hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer">
          <UIcon name="i-heroicons-home" class="h-3.5 w-3.5" />
          My Projects
        </NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="h-3 w-3" />
        <span class="text-slate-300 truncate max-w-[200px]">{{ project.title }}</span>
      </div>

      <!-- Header Section -->
      <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {{ project.title }}
          </h1>
          <p class="text-sm text-slate-400 mt-1">{{ project.abstract }}</p>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border"
            :class="statusConfig[project.status]?.bg + ' ' + statusConfig[project.status]?.color + ' border-white/10'"
          >
            <span class="h-1.5 w-1.5 rounded-full" :class="statusConfig[project.status]?.dot" />
            {{ statusConfig[project.status]?.label || project.status }}
          </span>
          <NuxtLink
            to="/student/my-projects"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-dark border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
            Back
          </NuxtLink>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- ─── Left Column ─── -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Project Details Card -->
          <div class="rounded-xl border border-slate-800 bg-gradient-to-b from-brand-bg to-brand-deep p-6">
            <div class="flex items-center gap-2 mb-4">
              <div class="p-1.5 rounded-lg bg-blue-500/10">
                <UIcon name="i-heroicons-document-text" class="h-4 w-4 text-blue-400" />
              </div>
              <h2 class="text-sm font-bold text-white uppercase tracking-wider">Project Details</h2>
            </div>

            <p class="text-sm text-slate-300 leading-relaxed mb-4">
              {{ project.description }}
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div class="p-3 rounded-lg bg-brand-dark/60 border border-slate-800">
                <div class="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <UIcon name="i-heroicons-users" class="h-3.5 w-3.5" />
                  Team Size
                </div>
                <p class="text-lg font-bold text-white">{{ project.team_size }}</p>
              </div>
              <div class="p-3 rounded-lg bg-brand-dark/60 border border-slate-800">
                <div class="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <UIcon name="i-heroicons-calendar" class="h-3.5 w-3.5" />
                  Created
                </div>
                <p class="text-sm font-bold text-white">{{ formatDate(project.created_at) }}</p>
              </div>
              <div class="p-3 rounded-lg bg-brand-dark/60 border border-slate-800">
                <div class="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <UIcon name="i-heroicons-eye" class="h-3.5 w-3.5" />
                  Visibility
                </div>
                <p class="text-sm font-bold text-white">{{ project.is_public ? 'Public' : 'Private' }}</p>
              </div>
            </div>

            <!-- Required Skills -->
            <div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Required Skills</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="skill in project.required_skills"
                  :key="skill"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                  :class="getSkillClasses(skill)"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>

          <!-- Team Members Card -->
          <div class="rounded-xl border border-slate-800 bg-gradient-to-b from-brand-bg to-brand-deep p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="p-1.5 rounded-lg bg-indigo-500/10">
                  <UIcon name="i-heroicons-users" class="h-4 w-4 text-indigo-400" />
                </div>
                <h2 class="text-sm font-bold text-white uppercase tracking-wider">Team Members</h2>
              </div>
              <span class="text-xs text-slate-500">{{ team.members.length }} / {{ project.team_size }}</span>
            </div>

            <div class="space-y-3">
              <div
                v-for="member in team.members"
                :key="member.id"
                class="flex items-start gap-4 p-4 rounded-xl border border-slate-800 bg-brand-dark/50 hover:bg-brand-dark/70 transition-colors"
              >
                <!-- Avatar -->
                <div class="relative flex-shrink-0">
                  <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/10">
                    {{ getInitials(member.name) }}
                  </div>
                  <div
                    v-if="member.role === 'leader'"
                    class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-purple-600 border-2 border-brand-dark flex items-center justify-center"
                  >
                    <UIcon name="i-heroicons-star" class="h-2.5 w-2.5 text-white" />
                  </div>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-sm font-bold text-white truncate">{{ member.profile.full_name }}</h3>
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                      :class="memberRoleConfig[member.role]?.bg + ' ' + memberRoleConfig[member.role]?.color + ' border-white/5'"
                    >
                      <UIcon :name="memberRoleConfig[member.role]?.icon || 'i-heroicons-user'" class="h-3 w-3" />
                      {{ memberRoleConfig[member.role]?.label || member.role }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-400 mb-1">{{ member.email }}</p>
                  <p class="text-xs text-slate-500 mb-2">
                    <span class="text-slate-400">{{ member.profile.department }}</span> ·
                    Year {{ member.profile.academic_year }}
                  </p>

                  <!-- Member Skills -->
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="skill in member.profile.skills"
                      :key="skill"
                      class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-700/50"
                    >
                      {{ skill }}
                    </span>
                  </div>
                </div>

                <UIcon v-if="member.role === 'leader'" name="i-heroicons-crown" class="h-5 w-5 text-purple-400 flex-shrink-0 mt-1" />
              </div>
            </div>

            <!-- Conditional Button: Invite Team Member OR Go to Kanban -->
            <button
              v-if="!isTeamComplete"
              class="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-700 text-xs font-semibold text-slate-500 hover:text-white hover:border-brand-purple hover:bg-brand-purple/10 transition-all cursor-pointer"
              @click="goToTeamBuilder"
            >
              <UIcon name="i-heroicons-user-plus" class="h-4 w-4" />
              Invite Team Member
            </button>

            <button
              v-else
              class="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-xs font-semibold text-emerald-400 hover:bg-emerald-600/30 transition-all cursor-pointer"
              @click="goToKanban"
            >
              <UIcon name="i-heroicons-view-columns" class="h-4 w-4" />
              Go to Kanban Board
            </button>
          </div>
        </div>

        <!-- ─── Right Column ─── -->
        <div class="space-y-6">
          <!-- Owner Card -->
          <div class="rounded-xl border border-slate-800 bg-gradient-to-b from-brand-bg to-brand-deep p-6">
            <div class="flex items-center gap-2 mb-4">
              <div class="p-1.5 rounded-lg bg-purple-500/10">
                <UIcon name="i-heroicons-user-circle" class="h-4 w-4 text-purple-400" />
              </div>
              <h2 class="text-sm font-bold text-white uppercase tracking-wider">Project Owner</h2>
            </div>

            <div class="flex items-center gap-3 mb-4">
              <div class="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-purple-600/10">
                {{ getInitials(project.owner.name) }}
              </div>
              <div>
                <h3 class="text-sm font-bold text-white">{{ project.owner.name }}</h3>
                <p class="text-xs text-slate-400">{{ project.owner.email }}</p>
              </div>
            </div>

            <div class="space-y-2.5 text-xs">
              <div class="flex items-center gap-2 text-slate-400">
                <UIcon name="i-heroicons-shield-check" class="h-3.5 w-3.5" :class="project.owner.status === 'active' ? 'text-emerald-500' : 'text-slate-600'" />
                <span :class="project.owner.status === 'active' ? 'text-emerald-400' : 'text-slate-400'">{{ project.owner.status }}</span>
              </div>
              <div class="flex items-center gap-2 text-slate-400">
                <UIcon name="i-heroicons-check-badge" class="h-3.5 w-3.5 text-blue-500" />
                <span>Profile {{ project.owner.profile_completed ? 'Completed' : 'Incomplete' }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions Card -->
          <div class="rounded-xl border border-slate-800 bg-gradient-to-b from-brand-bg to-brand-deep p-6">
            <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Actions</h2>
            <div class="space-y-2">
              <button
                class="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-dark border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-all cursor-pointer"
                @click="goToProposal"
              >
                <UIcon name="i-heroicons-pencil-square" class="h-4 w-4 text-amber-400" />
                Edit Proposal
              </button>
              <button
                v-if="!isTeamComplete"
                class="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-dark border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-purple-500 hover:bg-purple-500/10 transition-all cursor-pointer"
                @click="goToTeamBuilder"
              >
                <UIcon name="i-heroicons-user-plus" class="h-4 w-4 text-blue-400" />
                Invite Member
              </button>
              <button
                v-else
                class="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-dark border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-emerald-500 hover:bg-emerald-500/10 transition-all cursor-pointer"
                @click="goToKanban"
              >
                <UIcon name="i-heroicons-view-columns" class="h-4 w-4 text-emerald-400" />
                Kanban Board
              </button>
              <button
                class="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-dark border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-emerald-500 hover:bg-emerald-500/10 transition-all cursor-pointer"
                @click="$router.go(0)"
              >
                <UIcon name="i-heroicons-arrow-path" class="h-4 w-4 text-emerald-400" />
                Refresh Data
              </button>
              <div class="pt-2 border-t border-slate-800">
                <button class="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-dark border border-rose-900/50 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:border-rose-700 transition-all cursor-pointer">
                  <UIcon name="i-heroicons-trash" class="h-4 w-4" />
                  Delete Project
                </button>
              </div>
            </div>
          </div>

          <!-- Progress Card -->
          <div class="rounded-xl border border-slate-800 bg-gradient-to-b from-brand-bg to-brand-deep p-6">
            <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-3">Team Completion</h2>
            <div class="relative h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                :style="{ width: (team.members.length / project.team_size * 100) + '%' }"
              />
            </div>
            <p class="text-xs text-slate-400 mt-2">
              {{ team.members.length }} of {{ project.team_size }} members joined
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div class="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-heroicons-exclamation-triangle" class="h-8 w-8 text-slate-600" />
      </div>
      <h3 class="text-sm font-bold text-slate-400 mb-1">Project not found</h3>
      <p class="text-xs text-slate-600 mb-4">The project you're looking for doesn't exist or you don't have access.</p>
      <NuxtLink
        to="/student/my-projects"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all"
      >
        <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
        Back to Projects
      </NuxtLink>
    </div>
  </div>
</template>