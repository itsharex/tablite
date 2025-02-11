import { snakeCase } from 'scule'

export function usePromptTemplate(template: MaybeRef<string>, options: Record<string, any> = {}) {
  return computed(() => {
    let output = unref(template)
    for (const k in options)
      output = output.replaceAll(`{${snakeCase(k)}}`, String(options[k]))
    return output
  })
}
