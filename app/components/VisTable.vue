<script setup lang="tsx">
import * as VTable from '@visactor/vtable'
import { InputEditor } from '@visactor/vtable-editors'

const props = defineProps<{
  columns: string[]
  records: Record<string, any>[]
  editable?: boolean
  primaryKeys?: string[]
}>()

const Key = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#09090b">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
</svg>
`

const KeySolid = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#09090b" class="size-6">
  <path fill-rule="evenodd" d="M15.75 1.5a6.75 6.75 0 0 0-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 0 0-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 0 0 .75-.75v-1.5h1.5A.75.75 0 0 0 9 19.5V18h1.5a.75.75 0 0 0 .53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1 0 15.75 1.5Zm0 3a.75.75 0 0 0 0 1.5A2.25 2.25 0 0 1 18 8.25a.75.75 0 0 0 1.5 0 3.75 3.75 0 0 0-3.75-3.75Z" clip-rule="evenodd" />
</svg>
`

let instance: VTable.ListTable

const inputEditor = new InputEditor()
VTable.register.editor('input-editor', inputEditor)

VTable.register.icon('freeze', {
  type: 'svg',
  svg: Key,
  width: 14,
  height: 14,
  name: 'freeze',
  funcType: VTable.TYPES.IconFuncTypeEnum.frozen,
  positionType: VTable.TYPES.IconPosition.right,
  marginRight: 0,
  marginLeft: 12,
  cursor: 'pointer',
})

VTable.register.icon('frozenCurrent', {
  type: 'svg',
  svg: KeySolid,
  width: 14,
  height: 14,
  name: 'frozenCurrent',
  funcType: VTable.TYPES.IconFuncTypeEnum.frozen,
  positionType: VTable.TYPES.IconPosition.right,
  marginRight: 0,
  marginLeft: 12,
  cursor: 'pointer',
})

const domRef = ref()
const changes = ref<Record<string, string[]>>({})

const columns = computed(() => {
  const constantColumns = [
    props.editable
      ? {
          field: new Date().getTime().toString(),
          title: '',
          width: 36,
          headerType: 'checkbox',
          cellType: 'checkbox',
        }
      : undefined,
  ].filter(Boolean)

  const dynamicColumns = props.columns.map(column => ({
    field: column,
    title: column,
    width: 'auto',
    headerIcon: (props.primaryKeys ?? []).includes(column) ? 'freeze' : undefined,
    editor: props.editable ? 'input-editor' : undefined,
    fieldFormat: fieldFormatGenerator(column),
    style: {
      color: ({ dataValue }: any) => isEmpty(dataValue) ? '#d4d4d8' : '#27272a',
      bgColor: ({ row, col }: any) => changes.value[`${col}:${row}`] ? '#fef9c3' : !(row & 1) ? '#fafafa' : '#ffffff',
    },
  }))

  return [...constantColumns, ...dynamicColumns]
})

function fieldFormatGenerator(key: string) {
  return (record: any) => {
    const value = record?.[key]
    if (isEmpty(value))
      return 'EMPTY'
    return String(value)
  }
}

const options = computed<any>(() => ({
  columns: columns.value,
  records: props.records,
  theme: TABLITE_THEME,

  defaultRowHeight: 32,
  limitMaxAutoWidth: 256,
  limitMinWidth: 96,

  editCellTrigger: 'doubleclick' as const,

  autoFillWidth: true,

  tooltip: {
    isShowOverflowTextTooltip: false,
  },

  select: {
    blankAreaClickDeselect: true,
    outsideClickDeselect: true,
  },
}))

onMounted(() => {
  if (instance)
    return

  instance = new VTable.ListTable(domRef.value, options.value)

  instance.on('change_cell_value', ({ col, row, currentValue, changedValue }: any) => {
    if (!props.editable)
      return
    const key = [col, row].join(':')
    const origin = changes.value[key] ? changes.value[key][0] : currentValue
    if (origin === changedValue)
      delete changes.value[key]
    else
      changes.value[key] = [origin, changedValue]
  })
})

watch(options, async () => {
  instance.updateOption(options.value)
  changes.value = {}
})

function isEmpty(value: any) {
  return ['', undefined, null].includes(value)
}
</script>

<template>
  <div ref="domRef" class="w-full h-full flex-1 flex-shrink-0 text-xs" />
</template>
