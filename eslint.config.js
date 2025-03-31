import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'src-tauri',
    'app/components/ui',
    'app/lib',
  ],
})
