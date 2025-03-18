import { snakeCase } from 'scule'

export function usePromptTemplate(template: MaybeRef<string>, options: MaybeRef<Record<string, any>> = {}) {
  return computed(() => {
    let output = unref(template)
    const _options = unref(options)
    for (const k in _options)
      output = output.replaceAll(`{${snakeCase(k)}}`, String(_options[k]))
    return output
  })
}
