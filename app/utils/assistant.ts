interface DefineSystemPromptOptions {
  system: MaybeRef<string> | (() => Promise<MaybeRef<string>>)
}

export function defineAssistantContext(options: DefineSystemPromptOptions) {
  const store = storeToRefs(useAssistantStore())
  const system = typeof options.system === 'function' ? options.system() : Promise.resolve(options.system)

  async function setup() {
    store.system.value = unref(await system)
  }

  setup()
}
