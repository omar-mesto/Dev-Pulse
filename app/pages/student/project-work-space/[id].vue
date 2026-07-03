<script setup lang="ts">
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SingleProjectResponse, ProjectIdea, ProjectProposal, ProposalPayload, ProposalResponse } from '~/types/project'

const route = useRoute()
const router = useRouter()
const api = useApiClient()
const appToast = useAppToast()
const queryClient = useQueryClient()

// ─── Project ID from URL ───
const projectId = computed(() => {
  const id = route.params.id || route.params.projectId
  
return id ? Number(id) : 0
})

// ─── Proposal ID (saved after creation, used for fetching) ───
const proposalId = ref<number | null>(null)

// ─── Load proposalId from localStorage (client-only) ───
const loadProposalId = () => {
  if (import.meta.client) {
    const saved = localStorage.getItem(`proposal-id-for-project-${projectId.value}`)
    if (saved) {
      proposalId.value = Number(saved)
    }
  }
}

// ─── Save proposalId to localStorage (client-only) ───
const saveProposalId = (id: number) => {
  if (import.meta.client) {
    localStorage.setItem(`proposal-id-for-project-${projectId.value}`, String(id))
  }
}

// ─── Active Tab ───
const activeTab = ref<'kanban' | 'proposal'>('proposal')

// ─── Fetch Project Details ───
const { data: projectData } = useQuery<SingleProjectResponse>({
  queryKey: ['project-detail', projectId],
  queryFn: () => api.request<SingleProjectResponse>(`/project-ideas/${projectId.value}`),
  enabled: () => projectId.value > 0,
})

const project = computed<ProjectIdea | null>(() => projectData.value?.data?.project_idea ?? null)

// ─── Load saved proposalId on setup ───
loadProposalId()

// ─── Fetch Existing Proposal (BY PROPOSAL ID, not project id) ───
const { data: proposalData, isLoading: isLoadingProposal, refetch: refetchProposal } = useQuery<ProposalResponse>({
  queryKey: ['project-proposal', proposalId],
  queryFn: () => api.request<ProposalResponse>(`/project-proposals/${proposalId.value}`),
  enabled: () => !!proposalId.value && proposalId.value > 0,
  retry: false,
  staleTime: 0,
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,
})

const existingProposal = computed<ProjectProposal | null>(() => proposalData.value?.data?.proposal ?? null)

// ─── Form State ───
const form = reactive<ProposalPayload>({
  title: '',
  problem: '',
  problem_overview: '',
  comparison_table_with_similar_applications: '',
  project_users: '',
  mind_map_problem: null,
  solution_overview: '',
  proposed_solution: '',
  mind_map_solution: null,
  functional_requirements: '',
  non_functional_requirements: '',
  project_management: '',
  programming_languages: '',
  supervisor: '',
  project_teams: '',
  status: 'draft'
})

// ─── File Inputs ───
const mindMapProblemInput = ref<HTMLInputElement | null>(null)
const mindMapSolutionInput = ref<HTMLInputElement | null>(null)
const mindMapProblemPreview = ref<string | null>(null)
const mindMapSolutionPreview = ref<string | null>(null)

// ─── Track if form has been initialized ───
const isFormInitialized = ref(false)

// ─── Helper: Populate form from server proposal ───
const populateFormFromProposal = (proposal: ProjectProposal | null) => {
  if (!proposal) {
    isFormInitialized.value = false
    
return
  }

  form.title = proposal.title || ''
  form.problem = proposal.problem || ''
  form.problem_overview = proposal.problem_overview || ''
  form.comparison_table_with_similar_applications = proposal.comparison_table_with_similar_applications || ''
  form.project_users = proposal.project_users || ''
  form.solution_overview = proposal.solution_overview || ''
  form.proposed_solution = proposal.proposed_solution || ''
  form.functional_requirements = proposal.functional_requirements || ''
  form.non_functional_requirements = proposal.non_functional_requirements || ''
  form.project_management = proposal.project_management || ''
  form.programming_languages = proposal.programming_languages || ''
  form.supervisor = proposal.supervisor || ''
  form.project_teams = proposal.project_teams || ''
  form.status = proposal.status || 'draft'

  if (proposal.mind_map_problem_url) {
    mindMapProblemPreview.value = proposal.mind_map_problem_url
  } else {
    mindMapProblemPreview.value = null
  }

  if (proposal.mind_map_solution_url) {
    mindMapSolutionPreview.value = proposal.mind_map_solution_url
  } else {
    mindMapSolutionPreview.value = null
  }

  form.mind_map_problem = null
  form.mind_map_solution = null
  if (mindMapProblemInput.value) mindMapProblemInput.value.value = ''
  if (mindMapSolutionInput.value) mindMapSolutionInput.value.value = ''

  isFormInitialized.value = true
}

// ─── Fetch proposal on mount (client-side only) ───
onMounted(async () => {
  await nextTick()
  
  // If we have a saved proposalId, fetch it
  if (proposalId.value && proposalId.value > 0) {
    console.log('Fetching proposal by ID:', proposalId.value)
    const result = await refetchProposal()
    console.log('Fetch result:', result.data)
    
    if (result.data?.data?.proposal) {
      populateFormFromProposal(result.data.data.proposal)
    }
  } else {
    console.log('No proposalId saved yet')
  }
})

// ─── Watch proposalData ───
watch(
  proposalData,
  (newData) => {
    console.log('proposalData changed:', newData)
    if (newData?.data?.proposal) {
      populateFormFromProposal(newData.data.proposal)
    }
  },
  { immediate: false, deep: true }
)

// ─── Watch project title to auto-fill (only if no proposal exists) ───
watch(
  project,
  (p) => {
    if (p && !isFormInitialized.value && !form.title) {
      form.title = p.title
    }
  },
  { immediate: true }
)

// ─── Handle File Selection ───
const handleMindMapProblem = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    form.mind_map_problem = target.files[0]
    mindMapProblemPreview.value = URL.createObjectURL(target.files[0])
  }
}

const handleMindMapSolution = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    form.mind_map_solution = target.files[0]
    mindMapSolutionPreview.value = URL.createObjectURL(target.files[0])
  }
}

const clearMindMapProblem = () => {
  form.mind_map_problem = null
  mindMapProblemPreview.value = null
  if (mindMapProblemInput.value) mindMapProblemInput.value.value = ''
}

const clearMindMapSolution = () => {
  form.mind_map_solution = null
  mindMapSolutionPreview.value = null
  if (mindMapSolutionInput.value) mindMapSolutionInput.value.value = ''
}

// ─── Build FormData ───
const buildFormData = (): FormData => {
  const fd = new FormData()
  fd.append('title', form.title)
  if (form.problem) fd.append('problem', form.problem)
  if (form.problem_overview) fd.append('problem_overview', form.problem_overview)
  if (form.comparison_table_with_similar_applications) fd.append('comparison_table_with_similar_applications', form.comparison_table_with_similar_applications)
  if (form.project_users) fd.append('project_users', form.project_users)
  if (form.mind_map_problem) fd.append('mind_map_problem', form.mind_map_problem)
  if (form.solution_overview) fd.append('solution_overview', form.solution_overview)
  if (form.proposed_solution) fd.append('proposed_solution', form.proposed_solution)
  if (form.mind_map_solution) fd.append('mind_map_solution', form.mind_map_solution)
  if (form.functional_requirements) fd.append('functional_requirements', form.functional_requirements)
  if (form.non_functional_requirements) fd.append('non_functional_requirements', form.non_functional_requirements)
  if (form.project_management) fd.append('project_management', form.project_management)
  if (form.programming_languages) fd.append('programming_languages', form.programming_languages)
  if (form.supervisor) fd.append('supervisor', form.supervisor)
  if (form.project_teams) fd.append('project_teams', form.project_teams)
  fd.append('status', form.status)
  
  return fd
}

// ─── Create Proposal Mutation ───
const { mutate: createProposal, isPending: isCreating } = useMutation<ProposalResponse, Error, FormData>({
  mutationFn: async (formData) => {
    return await api.request<ProposalResponse>('/project-proposals', {
      method: 'POST',
      body: formData,
    })
  },
  onSuccess: (res) => {
    appToast.success('Success', res.message || 'Proposal created successfully')
    
    // CRITICAL: Save the proposalId from response
    if (res.data?.proposal?.id) {
      proposalId.value = res.data.proposal.id
      saveProposalId(res.data.proposal.id)
    }
    
    queryClient.invalidateQueries({ queryKey: ['project-proposal', proposalId] })
  },
  onError: (err) => {
    appToast.error('Error', err.message || 'Failed to create proposal')
  }
})

// ─── Update Proposal Mutation ───
const { mutate: updateProposal, isPending: isUpdating } = useMutation<ProposalResponse, Error, FormData>({
  mutationFn: async (formData) => {
    return await api.request<ProposalResponse>(`/project-proposals/${proposalId.value}`, {
      method: 'POST',
      body: formData,
    })
  },
  onSuccess: (res) => {
    appToast.success('Success', res.message || 'Proposal updated successfully')
    queryClient.invalidateQueries({ queryKey: ['project-proposal', proposalId] })
  },
  onError: (err) => {
    appToast.error('Error', err.message || 'Failed to update proposal')
  }
})

const isSaving = computed(() => isCreating.value || isUpdating.value)

const saveProposal = () => {
  const formData = buildFormData()
  if (proposalId.value && proposalId.value > 0) {
    updateProposal(formData)
  } else {
    createProposal(formData)
  }
}

const saveAsDraft = () => {
  form.status = 'draft'
  saveProposal()
}

const submitProposal = () => {
  form.status = 'submitted'
  saveProposal()
}

// ─── Kanban Data ───
const kanbanColumns = ref([
  { id: 'backlog', title: 'Backlog', color: 'bg-slate-500', tasks: [] as any[] },
  { id: 'todo', title: 'To Do', color: 'bg-amber-500', tasks: [] as any[] },
  { id: 'inprogress', title: 'In Progress', color: 'bg-blue-500', tasks: [] as any[] },
  { id: 'done', title: 'Done', color: 'bg-emerald-500', tasks: [] as any[] },
])

const newTaskTitle = ref('')
const activeColumn = ref<string | null>(null)

const addTask = (columnId: string) => {
  if (!newTaskTitle.value.trim()) return
  const column = kanbanColumns.value.find(c => c.id === columnId)
  if (column) {
    column.tasks.push({
      id: Date.now(),
      title: newTaskTitle.value,
      createdAt: new Date().toISOString()
    })
    newTaskTitle.value = ''
    activeColumn.value = null
  }
}

// ─── Navigation ───
const goToTeamBuilder = () => {
  router.push(`/student/team-builder/${projectId.value}`)
}

const goBack = () => {
  router.push('/student/my-projects')
}

const goToSupervisorMatching = () => {
  if (!proposalId.value) {
    appToast.error('Error', 'Please save your proposal first before sharing')
    
return
  }
  router.push(`/student/project-work-space/${projectId.value}/supervisors`)
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
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white transition-colors text-left"
          :class="activeTab === 'proposal' ? 'bg-panel-dark' : 'text-slate-400 hover:text-white hover:bg-panel-dark'"
          @click="activeTab = 'proposal'"
        >
          <UIcon name="i-heroicons-document-text" class="h-5 w-5" :class="activeTab === 'proposal' ? 'text-brand-purple' : 'text-slate-500'" />
          <p class="text-sm">Editor</p>
        </button>

        <button
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white transition-colors text-left"
          :class="activeTab === 'kanban' ? 'bg-panel-dark' : 'text-slate-400 hover:text-white hover:bg-panel-dark'"
          @click="activeTab = 'kanban'"
        >
          <UIcon name="i-heroicons-view-columns" class="h-5 w-5" :class="activeTab === 'kanban' ? 'text-brand-purple' : 'text-slate-500'" />
          <p class="text-sm">Kanban</p>
        </button>
      </nav>

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
            <h1 class="text-sm font-bold text-white">Project Workspace</h1>
            <p class="text-[11px] text-slate-500">{{ project?.title || 'Loading...' }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
            <div class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span class="text-xs text-emerald-400 font-medium">0 online</span>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-border-dark hover:border-slate-600"
              @click="activeTab = 'kanban'"
            >
              Kanban
            </button>
            <button
              class="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-border-dark hover:border-slate-600"
              @click="activeTab = 'proposal'"
            >
              Editor
            </button>
            <button 
              class="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-border-dark hover:border-slate-600 flex items-center gap-1"
              @click="goToSupervisorMatching"
            >
              <UIcon name="i-heroicons-share" class="h-3.5 w-3.5" />
              Share
            </button>
            <button
              class="flex items-center gap-1.5 bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
              :disabled="isSaving"
              @click="saveAsDraft"
            >
              <UIcon v-if="isSaving" name="i-heroicons-arrow-path" class="h-3.5 w-3.5 animate-spin" />
              <UIcon v-else name="i-heroicons-check" class="h-3.5 w-3.5" />
              {{ isSaving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </header>

      <!-- ─── PROPOSAL EDITOR TAB ─── -->
      <div v-if="activeTab === 'proposal'" class="flex-1 flex">
        <!-- Editor Area -->
        <div class="flex-1 p-8 overflow-y-auto">
          <div class="mx-auto">
            <!-- Loading State -->
            <div v-if="isLoadingProposal && !isFormInitialized" class="flex items-center justify-center py-12">
              <UIcon name="i-heroicons-arrow-path" class="h-6 w-6 animate-spin text-brand-purple" />
              <span class="ml-2 text-sm text-slate-400">Loading proposal...</span>
            </div>

            <template v-else>
              <!-- Status Badge -->
              <div class="mb-6">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border"
                  :class="form.status === 'draft' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="form.status === 'draft' ? 'bg-amber-400' : 'bg-emerald-400'" />
                  {{ form.status === 'draft' ? 'DRAFT' : 'SUBMITTED' }}
                </span>
              </div>

              <!-- Project Title -->
              <div class="mb-8">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Project Title</label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="Enter project title..."
                  class="w-full bg-transparent text-3xl font-bold text-white placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-brand-purple/50 pb-2 transition-colors"
                >
              </div>

              <!-- Problem -->
              <div class="mb-8">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Problem</label>
                <textarea
                  v-model="form.problem"
                  rows="3"
                  placeholder="Describe the core problem your project addresses..."
                  class="w-full bg-transparent text-sm text-slate-300 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-brand-purple/50 pb-2 transition-colors resize-none"
                />
              </div>

              <!-- Problem Overview -->
              <div class="mb-8">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Problem Overview</label>
                <textarea
                  v-model="form.problem_overview"
                  rows="4"
                  placeholder="Provide a detailed overview of the problem..."
                  class="w-full bg-transparent text-sm text-slate-300 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-brand-purple/50 pb-2 transition-colors resize-none"
                />
              </div>

              <!-- Comparison Table with Similar Applications -->
              <div class="mb-8">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Comparison with Similar Applications</label>
                <textarea
                  v-model="form.comparison_table_with_similar_applications"
                  rows="4"
                  placeholder="Compare your project with similar existing applications..."
                  class="w-full bg-transparent text-sm text-slate-300 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-brand-purple/50 pb-2 transition-colors resize-none"
                />
              </div>

              <!-- Project Users -->
              <div class="mb-8">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Target Users</label>
                <textarea
                  v-model="form.project_users"
                  rows="3"
                  placeholder="Who will use this system? Students, supervisors, admins..."
                  class="w-full bg-transparent text-sm text-slate-300 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-brand-purple/50 pb-2 transition-colors resize-none"
                />
              </div>

              <!-- Mind Map Problem -->
              <div class="mb-8">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Problem Mind Map</label>
                <div
                  class="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-brand-purple/50 transition-colors cursor-pointer"
                  @click="mindMapProblemInput?.click()"
                >
                  <input
                    ref="mindMapProblemInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleMindMapProblem"
                  >
                  <div v-if="mindMapProblemPreview" class="relative inline-block">
                    <img :src="mindMapProblemPreview" class="max-h-48 rounded-lg" alt="Problem Mind Map">
                    <button
                      class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center"
                      @click.stop="clearMindMapProblem"
                    >
                      <UIcon name="i-heroicons-x-mark" class="h-3 w-3" />
                    </button>
                  </div>
                  <div v-else>
                    <UIcon name="i-heroicons-photo" class="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p class="text-xs text-slate-500">Click to upload mind map image</p>
                  </div>
                </div>
              </div>

              <!-- Solution Overview -->
              <div class="mb-8">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Solution Overview</label>
                <textarea
                  v-model="form.solution_overview"
                  rows="4"
                  placeholder="High-level overview of your proposed solution..."
                  class="w-full bg-transparent text-sm text-slate-300 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-brand-purple/50 pb-2 transition-colors resize-none"
                />
              </div>

              <!-- Proposed Solution -->
              <div class="mb-8">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Proposed Solution</label>
                <textarea
                  v-model="form.proposed_solution"
                  rows="5"
                  placeholder="Detailed explanation of your solution, architecture, and approach..."
                  class="w-full bg-transparent text-sm text-slate-300 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-brand-purple/50 pb-2 transition-colors resize-none"
                />
              </div>

              <!-- Mind Map Solution -->
              <div class="mb-8">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Solution Mind Map</label>
                <div
                  class="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-brand-purple/50 transition-colors cursor-pointer"
                  @click="mindMapSolutionInput?.click()"
                >
                  <input
                    ref="mindMapSolutionInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleMindMapSolution"
                  >
                  <div v-if="mindMapSolutionPreview" class="relative inline-block">
                    <img :src="mindMapSolutionPreview" class="max-h-48 rounded-lg" alt="Solution Mind Map">
                    <button
                      class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center"
                      @click.stop="clearMindMapSolution"
                    >
                      <UIcon name="i-heroicons-x-mark" class="h-3 w-3" />
                    </button>
                  </div>
                  <div v-else>
                    <UIcon name="i-heroicons-photo" class="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p class="text-xs text-slate-500">Click to upload mind map image</p>
                  </div>
                </div>
              </div>

              <!-- Functional Requirements -->
              <div class="mb-8">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Functional Requirements</label>
                <textarea
                  v-model="form.functional_requirements"
                  rows="4"
                  placeholder="List the functional requirements of the system..."
                  class="w-full bg-transparent text-sm text-slate-300 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-brand-purple/50 pb-2 transition-colors resize-none"
                />
              </div>

              <!-- Non-Functional Requirements -->
              <div class="mb-8">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Non-Functional Requirements</label>
                <textarea
                  v-model="form.non_functional_requirements"
                  rows="3"
                  placeholder="Performance, security, scalability, usability requirements..."
                  class="w-full bg-transparent text-sm text-slate-300 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-brand-purple/50 pb-2 transition-colors resize-none"
                />
              </div>

              <!-- Project Management -->
              <div class="mb-8">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Project Management</label>
                <textarea
                  v-model="form.project_management"
                  rows="3"
                  placeholder="Agile methodology, meeting schedule, communication tools, task management..."
                  class="w-full bg-transparent text-sm text-slate-300 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-brand-purple/50 pb-2 transition-colors resize-none"
                />
              </div>

              <!-- Programming Languages -->
              <div class="mb-8">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Programming Languages & Technologies</label>
                <input
                  v-model="form.programming_languages"
                  type="text"
                  placeholder="e.g. PHP, JavaScript, TypeScript, HTML, CSS, Laravel, Vue.js, Nuxt..."
                  class="w-full bg-transparent text-sm text-slate-300 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-brand-purple/50 pb-2 transition-colors"
                >
              </div>

              <!-- Supervisor -->
              <div class="mb-8">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Supervisor</label>
                <input
                  v-model="form.supervisor"
                  type="text"
                  placeholder="Dr. ..."
                  class="w-full bg-transparent text-sm text-slate-300 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-brand-purple/50 pb-2 transition-colors"
                >
              </div>

              <!-- Project Teams -->
              <div class="mb-8">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Project Team Members</label>
                <textarea
                  v-model="form.project_teams"
                  rows="2"
                  placeholder="Name - Role, Name - Role..."
                  class="w-full bg-transparent text-sm text-slate-300 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-brand-purple/50 pb-2 transition-colors resize-none"
                />
              </div>

              <!-- Tech Stack (Read-only from project) -->
              <div class="mb-8">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Required Skills (from Project)</label>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="skill in project?.required_skills || []"
                    :key="skill"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-slate-500/10 text-slate-400 border-slate-700/50"
                  >
                    {{ skill }}
                  </span>
                  <span v-if="!project?.required_skills?.length" class="text-xs text-slate-600 italic">No skills specified</span>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  class="flex-1 flex items-center justify-center gap-2 bg-brand-purple hover:bg-brand-purple-hover text-white text-sm font-medium px-5 py-3 rounded-xl transition-all disabled:opacity-50"
                  :disabled="isSaving"
                  @click="submitProposal"
                >
                  <UIcon v-if="isSaving" name="i-heroicons-arrow-path" class="h-4 w-4 animate-spin" />
                  <UIcon v-else name="i-heroicons-paper-airplane" class="h-4 w-4" />
                  {{ isSaving ? 'Saving...' : 'Submit Proposal' }}
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- ─── KANBAN TAB ─── -->
      <div v-else class="flex-1 p-6 overflow-x-auto">
        <div class="flex gap-4 min-w-max h-full">
          <div
            v-for="column in kanbanColumns"
            :key="column.id"
            class="w-72 flex flex-col"
          >
            <!-- Column Header -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full" :class="column.color" />
                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider">{{ column.title }}</h3>
                <span class="text-xs text-slate-500">{{ column.tasks.length }}</span>
              </div>
              <button
                class="text-slate-500 hover:text-white transition-colors"
                @click="activeColumn = activeColumn === column.id ? null : column.id"
              >
                <UIcon name="i-heroicons-plus" class="h-4 w-4" />
              </button>
            </div>

            <!-- Add Task Input -->
            <div v-if="activeColumn === column.id" class="mb-3">
              <input
                v-model="newTaskTitle"
                type="text"
                placeholder="Enter task title..."
                class="w-full bg-panel-dark border border-border-dark rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
                autofocus
                @keydown.enter="addTask(column.id)"
                @blur="activeColumn = null"
              >
            </div>

            <!-- Tasks -->
            <div class="flex-1 space-y-2">
              <div
                v-for="task in column.tasks"
                :key="task.id"
                class="p-3 rounded-lg bg-panel-dark border border-border-dark hover:border-slate-600 transition-colors cursor-pointer"
              >
                <p class="text-xs text-slate-300">{{ task.title }}</p>
              </div>

              <!-- Empty State -->
              <div v-if="column.tasks.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
                <p class="text-xs text-slate-600">No tasks yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>