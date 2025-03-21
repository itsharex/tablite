export function useAssistant() {
  const prompt = ref('')
  const { register } = useAssistantPromptCommand(prompt)

  register('clear', () => {})

  return {
    prompt,
  }
}

export function useAssistantPromptCommand(value: MaybeRef<string>) {
  const commands: Record<string, () => MaybePromise<void>> = {}

  async function trigger() {
    if (unref(value).startsWith('/')) {
      const command = unref(value).split(' ')[0]!.replace('/', '')
      await commands[command]?.()
    }
  }

  function register(command: string, callback: () => MaybePromise<void>) {
    commands[command] = callback
  }

  return {
    trigger,
    register,
  }
}
