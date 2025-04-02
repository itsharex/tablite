interface Step {
  title: string
  description: string
  status: 'pending' | 'running' | 'succeeded' | 'failed'
}

export function useSteps() {
  const step = ref(0)
  const steps = ref<Step[]>([])

  function register(value: Omit<Step, 'status'> | Omit<Step, 'status'>[]) {
    const _steps = Array.isArray(value) ? value : [value]
    steps.value = _steps.map(step => ({ ...step, status: 'pending' }))
  }

  function next(status: Step['status'] = 'succeeded') {
    steps.value.at(step.value)!.status = status
    if (status === 'succeeded') {
      step.value++
      if (step.value >= steps.value.length)
        return
      steps.value.at(step.value)!.status = 'running'
    }
  }

  function reset() {
    step.value = 0
    steps.value = steps.value.map(step => ({ ...step, status: 'pending' }))
  }

  return {
    step,
    steps,
    register,
    next,
    reset,
  }
}
