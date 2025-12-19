import { useMutation, useQuery } from '@tanstack/react-query'
import { useGamesMasterContext } from '../contexts'
import { gamesMasterService } from '../lib/api/services'
import { showToast } from '../lib/toast'

export function useGamesMaster() {
  const { gm, setGM, clearGM, isGM } = useGamesMasterContext()

  // Create a new Games Master
  const createMutation = useMutation({
    mutationFn: (name: string) => gamesMasterService.create({ name }),
    onSuccess: (newGM) => {
      setGM(newGM)
      showToast.success(`Welcome! Your host code is: ${newGM.hostCode}`)
    },
  })

  // Retrieve Games Master by name (for code retrieval)
  const retrieveByNameMutation = useMutation({
    mutationFn: (name: string) => gamesMasterService.getByName(name),
    onSuccess: (gms) => {
      if (gms.length === 0) {
        showToast.error('No Games Master found with that name')
      } else if (gms.length === 1) {
        // Only one match, show the code
        showToast.success(`Your host code is: ${gms[0].hostCode}`)
      } else {
        // Multiple matches, show all codes
        const codes = gms.map((g) => g.hostCode).join(', ')
        showToast.info(`Found ${gms.length} matches. Codes: ${codes}`)
      }
    },
  })

  // Load Games Master by code
  const loadByCodeMutation = useMutation({
    mutationFn: (code: string) => gamesMasterService.getByCode(code),
    onSuccess: (loadedGM) => {
      setGM(loadedGM)
      showToast.success(`Welcome back, ${loadedGM.name}!`)
    },
  })

  return {
    // Current GM state
    gm,
    isGM,

    // Actions
    createGamesMaster: createMutation.mutate,
    retrieveCodeByName: retrieveByNameMutation.mutate,
    loadByCode: loadByCodeMutation.mutate,
    clearGamesMaster: clearGM,

    // Loading states
    isCreating: createMutation.isPending,
    isRetrieving: retrieveByNameMutation.isPending,
    isLoading: loadByCodeMutation.isPending,

    // Results
    retrievedGMs: retrieveByNameMutation.data,
  }
}
