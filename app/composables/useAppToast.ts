export const useAppToast = () => {
  const toast = useToast()

  const success = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
  }

  const error = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle'
    })
  }

  const warning = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'warning',
      icon: 'i-heroicons-exclamation-circle'
    })
  }

  return {
    success,
    error,
    warning
  }
}