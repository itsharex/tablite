import Shiki from '@shikijs/markdown-it'
import markdownit from 'markdown-it'

const md = markdownit()

async function register() {
  md.use(await Shiki({
    themes: {
      light: 'vitesse-dark',
      dark: 'vitesse-dark',
    },

    fallbackLanguage: 'shell',
  }))
}

register()

export function useMdit() {
  return {
    md,
  }
}
