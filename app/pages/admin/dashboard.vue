<script setup lang="ts">
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { TableColumn } from '@nuxt/ui'


const queryClient = useQueryClient()
const appToast = useAppToast()
const api = useApiClient()

const { data: queryResponse, isLoading, isError } = useQuery<PendingUsersResponse>({
  queryKey: ['pendingUsers'],
  queryFn: async () => {
    return await api.request<PendingUsersResponse>('/admin/users/pending', {
      method: 'GET'
    })
  }
})

const pendingData = computed<UserProfile[]>(() => {
  const res = queryResponse.value
  if (!res) return []
  
  if (Array.isArray(res.data)) {
    return res.data
  } else if (res.data && typeof res.data === 'object' && 'data' in res.data && Array.isArray(res.data.data)) {
    return res.data.data
  }
  
  return []
})

const { mutate: approveUser } = useMutation({
  mutationFn: async (userId: number) => {
    return await api.request<{ message: string }>(`/admin/users/${userId}/approve`, {
      method: 'PUT'
    })
  },
  onSuccess: (res) => {
    appToast.success('Approved!', res.message || 'User account is now active.')
    queryClient.invalidateQueries({ queryKey: ['pendingUsers'] })
  }
})

const { mutate: rejectUser } = useMutation({
  mutationFn: async (userId: number) => {
    return await api.request<{ message: string }>(`/admin/users/${userId}/reject`, {
      method: 'PUT'
    })
  },
  onSuccess: (res) => {
    appToast.success('Rejected', res.message || 'Registration request declined.')
    queryClient.invalidateQueries({ queryKey: ['pendingUsers'] })
  }
})

const copyIdToClipboard = (id: number) => {
  navigator.clipboard.writeText(id.toString())
  appToast.success('Copied!', `User ID ${id} copied to clipboard.`)
}

const tableColumns: TableColumn<UserProfile>[] = [
  { accessorKey: 'id', header: 'ID' },
  {
    header: 'Full Name',
    cell: ({ row }) => {
      const user = row.original
      const name = user.profile?.full_name || user.name
      
return h('span', { class: 'text-white font-bold' }, name)
    }
  },
  { accessorKey: 'email', header: 'Email Address' },
  {
    header: 'Requested Role',
    cell: ({ row }) => {
      const role = row.original.role || ''
      const isSupervisor = role.toLowerCase() === 'supervisor'
      
      return h(
        'span',
        {
          class: [
            'px-2 py-0.5 rounded-md text-[10px] font-bold border',
            isSupervisor ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' : 'bg-amber-500/5 text-amber-400 border-amber-500/10'
          ]
        },
        role
      )
    }
  },
  {
    header: 'Department',
    cell: ({ row }) => h('span', { class: 'truncate max-w-[150px] block text-slate-400' }, row.original.profile?.department || 'N/A')
  },
  {
    id: 'actions',
    header: 'Actions'
  }
]

const getActionMenuItems = (user: UserProfile) => [
  [
    {
      label: 'Copy System ID',
      icon: 'i-heroicons-clipboard-document',
      onSelect: () => copyIdToClipboard(user.id)
    }
  ],
  [
    {
      label: 'Approve Membership',
      icon: 'i-heroicons-check-circle',
      iconClass: 'text-emerald-400',
      labelClass: 'text-emerald-400',
      onSelect: () => approveUser(user.id)
    },
    {
      label: 'Reject & Discard',
      icon: 'i-heroicons-x-circle',
      iconClass: 'text-rose-400',
      labelClass: 'text-rose-400',
      onSelect: () => rejectUser(user.id)
    }
  ]
]
</script>

<template>
  <div class="min-h-screen bg-brand-deep text-slate-100 font-sans flex flex-col">
    
    <header class="h-16 p-5 border-purple-950/20 bg-brand-dark px-6 flex items-center justify-between sticky top-0 z-40">
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold">
          <UIcon name="i-heroicons-bolt" class="h-4 w-4" />
        </div>
        <span class="text-md font-bold tracking-tight text-white flex items-center gap-2">
          DevPulse Control Center
        </span>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="text-right hidden sm:block">
          <p class="text-xs font-bold text-white">System Administrator</p>
          <p class="text-[10px] text-purple-400/80 font-mono">kareem@devpulse.local</p>
        </div>
        <UAvatar src="" alt="Kareem" size="sm" class="bg-purple-600 border border-purple-400/30 text-white font-bold" />
      </div>
    </header>

    <div class="flex-1 flex">
      
      <aside class="hidden lg:flex flex-col w-64 bg-brand-dark border-purple-950/20 p-4 space-y-2">        
        <NuxtLink to="/admin/dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-purple-600/10 text-purple-400">
          <UIcon name="i-heroicons-users" class="h-4 w-4" />
          <span>Pending Approvals</span>
        </NuxtLink>

        <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all">
          <UIcon name="i-heroicons-square-3-stack-3d" class="h-4 w-4" />
          <span>Platform Projects</span>
        </a>

        <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all">
          <UIcon name="i-heroicons-cog-6-tooth" class="h-4 w-4" />
          <span>Global Settings</span>
        </a>
      </aside>

      <main class="flex-1 p-6 lg:p-8 overflow-x-hidden space-y-6">
        
        <div class="space-y-1">
          <h1 class="text-2xl font-black tracking-tight text-white">Pending Registrations</h1>
          <p class="text-xs text-slate-400">Review, approve, or discard pending Academic Supervisions and Committee Members accounts.</p>
        </div>

        <div v-if="isLoading" class="p-12 text-center bg-brand-dark rounded-xl space-y-3">
          <UIcon name="i-heroicons-arrow-path" class="h-6 w-6 animate-spin text-purple-500 mx-auto" />
          <p class="text-xs text-slate-400">Fetching live enrollment applications...</p>
        </div>

        <div v-else-if="isError" class="p-8 text-center bg-rose-500/5 rounded-xl text-rose-400 text-xs">
          An error occurred while populating user requests. Please verify backend state.
        </div>

        <div v-else class="bg-brand-dark rounded-xl shadow-xl overflow-hidden">
          <ClientOnly>
            <UTable 
              :data="pendingData" 
              :columns="tableColumns"
              class="text-slate-400 border-0"
            >
              <template #actions-cell="{ row }">
                <UDropdownMenu :items="getActionMenuItems(row.original)" :popper="{ placement: 'bottom-end' }">
                  <UButton 
                    color="error" 
                    variant="ghost" 
                    class="hover:bg-slate-800 rounded-lg cursor-pointer flex items-center justify-center p-2"
                  >
                    <UIcon name="i-heroicons-ellipsis-horizontal" class="h-5 w-5 text-slate-400" />
                  </UButton>
                </UDropdownMenu>
              </template>

              <template #empty-state>
                <div class="p-12 text-center text-slate-500 text-xs font-medium">
                  <UIcon name="i-heroicons-inbox" class="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  No pending enrollment applications found.
                </div>
              </template>
            </UTable>
          </ClientOnly>
        </div>

      </main>
    </div>
  </div>
</template>