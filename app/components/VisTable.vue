<script setup lang="tsx">
import * as VTable from '@visactor/vtable'
import { InputEditor } from '@visactor/vtable-editors'
import { createGroup, Tag } from '@visactor/vtable/es/vrender'

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

let instance: VTable.ListTableSimple

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
  cursor: 'pointer',
})

const domRef = ref()

const columns = computed(() => props.columns.map(column => ({
  field: column,
  title: column,
  width: 'auto',
  headerIcon: (props.primaryKeys ?? []).includes(column) ? 'freeze' : undefined,
  editor: props.editable ? 'input-editor' : undefined,

  fieldFormat: fieldFormatGenerator(column),
  customLayout,

  style: {
    color: ({ dataValue }: any) => isEmpty(dataValue) ? '#d4d4d8' : '#27272a',
  },

})))

function fieldFormatGenerator(key: string) {
  return (record: any) => {
    const value = record?.[key]
    if (isBlob(value))
      return 'BLOB'
    if (isEmpty(value))
      return 'EMPTY'
    return value
  }
}

const options = computed<any>(() => ({
  columns: columns.value,
  records: props.records,
  theme: TABLITE_THEME,

  defaultRowHeight: 32,

  editCellTrigger: 'doubleclick' as const,

  keyboardOptions: {
    copySelected: true,
    pasteValueToCell: true,
    selectAllOnCtrlA: true,
  },

  tooltip: {
    isShowOverflowTextTooltip: false,
  },
}))

onMounted(() => {
  instance = new VTable.ListTableSimple(domRef.value, options.value)
})

watch(options, async () => {
  instance.updateOption(options.value)
})

function isEmpty(value: any) {
  return ['', undefined, null].includes(value)
}

function isBlob(value: any) {
  return Array.isArray(value)
}

function customLayout({ row, col, dataValue, rect, table }: any) {
  if (typeof dataValue === 'number')
    return { renderDefault: true }
  if (typeof dataValue === 'string' && dataValue.length < 1024)
    return { renderDefault: true }
  if ([undefined, null, ''].includes(dataValue))
    return { renderDefault: true }

  const { height, width } = rect ?? table.getCellRect(col, row)
  const container = createGroup({
    height,
    width,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
  })

  const text = isBlob(dataValue) ? 'BLOB' : 'LONG TEXT'
  const tag = new Tag({
    text,
    textStyle: {
      fontSize: 12 * 0.75,
      fontWeight: 600,
      fill: '#ffffff',
    },
    panel: {
      visible: true,
      fill: '#000000',
      cornerRadius: 12,
    },
    boundsPadding: [8, 0, 0, 12],
    padding: [3, 10, 3, 10],
  })

  container.add(tag as any)

  return {
    rootContainer: container,
    renderDefault: false,
  }
}
</script>

<template>
  <div ref="domRef" class="w-full h-full flex-1 flex-shrink-0 text-xs" />
</template>
