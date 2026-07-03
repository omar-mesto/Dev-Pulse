<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import type { MyProjectsResponse, ProjectIdea } from '~/types/project'

definePageMeta({
  layout: 'blank'
})

// ─── Search & Filter State ───
const searchQuery = ref('')
const statusFilter = ref('all')

const api = useApiClient()
const router = useRouter()

// ─── Fetch Projects from Real API ───
const { data: projectsData, isLoading: isLoadingProjects } = useQuery<MyProjectsResponse>({
  queryKey: ['my-projects'],
  queryFn: () => api.request<MyProjectsResponse>('/my-projects'),
})

const projects = computed<ProjectIdea[]>(() => projectsData.value?.data?.projects ?? [])

// ─── Computed: filtered projects ───
const filteredProjects = computed(() => {
  return projects.value.filter((p: ProjectIdea) => {
    const matchesSearch = !searchQuery.value ||
      p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.abstract.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.required_skills.some((s: string) => s.toLowerCase().includes(searchQuery.value.toLowerCase()))
    const matchesStatus = statusFilter.value === 'all' || p.status === statusFilter.value
    
return matchesSearch && matchesStatus
  })
})

const publishedCount = computed(() => projects.value.filter((p: ProjectIdea) => p.status === 'published').length)
const formingCount = computed(() => projects.value.filter((p: ProjectIdea) => p.status === 'forming').length)
const completedCount = computed(() => projects.value.filter((p: ProjectIdea) => p.status === 'team_completed').length)

// ─── Helpers ───
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  
return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  published:     { label: 'Published',     color: 'text-emerald-400',  bg: 'bg-emerald-500/10',  dot: 'bg-emerald-400' },
  forming:       { label: 'Forming',       color: 'text-amber-400',    bg: 'bg-amber-500/10',    dot: 'bg-amber-400' },
  team_completed:{ label: 'Team Ready',    color: 'text-blue-400',     bg: 'bg-blue-500/10',     dot: 'bg-blue-400' },
  draft:         { label: 'Draft',         color: 'text-slate-400',    bg: 'bg-slate-500/10',    dot: 'bg-slate-400' },
  archived:      { label: 'Archived',      color: 'text-rose-400',     bg: 'bg-rose-500/10',     dot: 'bg-rose-400' }
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

const skillColors: Record<string, string> = {
  vue: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'vue.js': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  nuxt: 'bg-green-500/10 text-green-400 border-green-500/20',
  laravel: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'machine learning': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  python: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  tensorflow: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  mysql: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  tailwind: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  d3: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  elasticsearch: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'ar.js': 'bg-pink-500/10 text-pink-400 border-pink-500/20'
}

const getSkillClasses = (skill: string) => {
  const key = skill.toLowerCase()
  
return skillColors[key] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
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

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl lg:text-3xl font-black text-white tracking-tight">My Projects</h1>
          <p class="text-sm text-slate-400 mt-1">Manage and track all your project ideas</p>
        </div>
        <NuxtLink
          to="/student/create-project"
          class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <UIcon name="i-heroicons-plus" class="h-4 w-4" />
          New Project
        </NuxtLink>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="p-4 rounded-xl border border-slate-800 bg-gradient-to-b from-brand-bg to-brand-deep">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-folder" class="h-4 w-4 text-blue-400" />
            <span class="text-xs text-slate-500 font-medium">Total Projects</span>
          </div>
          <p class="text-2xl font-black text-white">{{ projects.length }}</p>
        </div>
        <div class="p-4 rounded-xl border border-slate-800 bg-gradient-to-b from-brand-bg to-brand-deep">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-globe-alt" class="h-4 w-4 text-emerald-400" />
            <span class="text-xs text-slate-500 font-medium">Published</span>
          </div>
          <p class="text-2xl font-black text-emerald-400">{{ publishedCount }}</p>
        </div>
        <div class="p-4 rounded-xl border border-slate-800 bg-gradient-to-b from-brand-bg to-brand-deep">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-users" class="h-4 w-4 text-amber-400" />
            <span class="text-xs text-slate-500 font-medium">Forming</span>
          </div>
          <p class="text-2xl font-black text-amber-400">{{ formingCount }}</p>
        </div>
        <div class="p-4 rounded-xl border border-slate-800 bg-gradient-to-b from-brand-bg to-brand-deep">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-check-circle" class="h-4 w-4 text-blue-400" />
            <span class="text-xs text-slate-500 font-medium">Team Ready</span>
          </div>
          <p class="text-2xl font-black text-blue-400">{{ completedCount }}</p>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <div class="relative flex-1">
          <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search projects, skills..."
            class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-brand-dark border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          >
        </div>
        <select
          v-model="statusFilter"
          class="px-4 py-2.5 rounded-lg bg-brand-dark border border-slate-800 text-sm text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="forming">Forming</option>
          <option value="team_completed">Team Ready</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingProjects" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <div v-for="i in 6" :key="i" class="rounded-xl border border-slate-800 bg-gradient-to-b from-brand-bg to-brand-deep p-5 animate-pulse">
          <div class="flex items-start gap-3 mb-3">
            <div class="h-10 w-10 rounded-lg bg-slate-700 flex-shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-slate-700 rounded w-3/4" />
              <div class="h-3 bg-slate-700 rounded w-1/2" />
            </div>
          </div>
          <div class="h-3 bg-slate-700 rounded w-full mb-4" />
          <div class="flex gap-2 mb-4">
            <div class="h-5 w-16 bg-slate-700 rounded" />
            <div class="h-5 w-16 bg-slate-700 rounded" />
          </div>
          <div class="flex justify-between pt-4 border-t border-slate-800">
            <div class="h-3 w-20 bg-slate-700 rounded" />
            <div class="h-3 w-16 bg-slate-700 rounded" />
          </div>
        </div>
      </div>

      <!-- Projects Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="group rounded-xl border border-slate-800 bg-gradient-to-b from-brand-bg to-brand-deep p-5 hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-600/10 flex-shrink-0">
                {{ getInitials(project.title) }}
              </div>
              <div class="min-w-0">
                <h3 class="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                  {{ project.title }}
                </h3>
                <p class="text-[11px] text-slate-500 truncate">{{ project.owner.name }}</p>
              </div>
            </div>
          </div>

          <!-- Abstract -->
          <p class="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
            {{ project.abstract }}
          </p>

          <!-- Skills -->
          <div class="flex flex-wrap gap-1.5 mb-4">
            <span
              v-for="skill in project.required_skills"
              :key="skill"
              class="px-2 py-0.5 rounded text-[10px] font-semibold border"
              :class="getSkillClasses(skill)"
            >
              {{ skill }}
            </span>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-4 border-t border-slate-800">
            <div class="flex items-center gap-3 text-[11px] text-slate-500">
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-users" class="h-3.5 w-3.5" />
                {{ project.team_size }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-calendar" class="h-3.5 w-3.5" />
                {{ formatDate(project.created_at) }}
              </span>
            </div>
            <NuxtLink
              :to="`/student/project-work-space/${project.id}`"
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-dark border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-all cursor-pointer"
            >
              View
              <UIcon name="i-heroicons-arrow-right" class="h-3 w-3" />
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoadingProjects && filteredProjects.length === 0" class="text-center py-16">
        <div class="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-folder-open" class="h-8 w-8 text-slate-600" />
        </div>
        <h3 class="text-sm font-bold text-slate-400 mb-1">No projects found</h3>
        <p class="text-xs text-slate-600">Try adjusting your search or filters</p>
      </div>
    </div>
  </div>
</template>