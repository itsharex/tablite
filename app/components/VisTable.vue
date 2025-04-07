<script setup lang="tsx">
import * as VTable from '@visactor/vtable'
import { InputEditor } from '@visactor/vtable-editors'
import { klona } from 'klona'
import { toast } from 'vue-sonner'

interface Props {
  columns: string[]
  records: Record<string, any>[]
  changes?: Record<string, Record<string, any[]>>
  inserts?: Record<string, any>[]
  deletes?: string[]
  editable?: boolean
  selectedRowKeys?: (string | number)[]
  primaryKeys?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  changes: () => ({}),
  inserts: () => [],
  deletes: () => [],
  selectedRowKeys: () => [],
  primaryKeys: () => [],
})

const emit = defineEmits(['update:changes', 'update:inserts', 'update:selectedRowKeys'])

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

VTable.register.icon('frozen', {
  type: 'svg',
  svg: KeySolid,
  width: 14,
  height: 14,
  name: 'frozen',
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

let selectedRowRecord: Record<string, string | number> = {}

const domRef = ref()

/**
 * Tracks changes made to table cell contents, where:
 * - The outer key is a stringified row identifier (e.g., JSON string of row ID)
 * - The inner key is the column/property name that was modified
 * - The value is an array containing the new content(s)
 *
 * @example
 * // Changes for row with ID "93uisjxquq", updating the "content" column from "hi" to "hi tablite"
 * { "{\"id\":\"93uisjxquq\"}": { "content": ["hi", "hi tablite"] } }
 */
const changes = useVModel(props, 'changes', emit)

const inserts = useVModel(props, 'inserts', emit)
const selectedRowKeys = useVModel(props, 'selectedRowKeys', emit)
const originRecordKeys = ref<string[]>([])

const records = computed(() => {
  if (!props.editable)
    return props.records

  const source = props.records.map((record, index) => {
    const key = originRecordKeys.value[index]!
    record.__TABLITE_ROW_KEY = key

    for (const column in record) {
      const [_, changed] = changes.value[key]?.[column] ?? []
      if (changed)
        record[column] = changed
    }

    return record
  })

  return [
    ...inserts.value,
    ...source,
  ]
})

const columns = computed(() => {
  const constantColumns = [
    props.editable
      ? {
          field: new Date().getTime().toString(),
          title: '',
          width: 36,
          headerType: 'checkbox',
          cellType: 'checkbox',
          disableSelect: true,
          disableHeaderSelect: true,
          disableColumnResize: true,
          style: {
            bgColor: ({ col, row }: any) => calcCellBgColor(col, row),
          },
        }
      : undefined,
  ].filter(Boolean)

  const dynamicColumns = props.columns.map(column => ({
    field: column,
    title: column,
    width: 'auto',
    headerIcon: (props.primaryKeys ?? []).includes(column) ? 'freeze' : undefined,
    editor: props.editable ? 'input-editor' : undefined,
    disableSelect: !props.editable,
    disableHeaderSelect: !props.editable,
    disableColumnResize: !props.editable,
    fieldFormat: fieldFormatGenerator(column),
    style: {
      color: ({ dataValue }: any) => isEmpty(dataValue) ? '#d4d4d8' : '#27272a',
      bgColor: ({ col, row }: any) => calcCellBgColor(col, row),
    },
  }))

  return [...constantColumns, ...dynamicColumns]
})

function fieldFormatGenerator(key: string) {
  return (record: any) => {
    const value = record?.[key]
    if ([null, undefined].includes(value))
      return 'NULL'
    if (value === '')
      return 'EMPTY'
    return String(value)
  }
}

const options = computed<any>(() => ({
  columns: columns.value,
  records: records.value,
  theme: TABLITE_THEME,

  defaultRowHeight: 32,
  limitMaxAutoWidth: 256,
  limitMinWidth: 96,

  editCellTrigger: 'doubleclick' as const,

  autoFillWidth: true,
  columnResizeMode: 'header',
  dragHeaderMode: 'column',

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

    const column = columns.value[col]
    if (!column)
      return
    if (row <= inserts.value.length && inserts.value[row - 1]) {
      inserts.value[row - 1]![column.field] = changedValue
      return
    }
    const key = instance.records[row - 1].__TABLITE_ROW_KEY
    if (!key)
      return
    const _changes = klona(changes.value)
    // Initial row changes if not exists
    if (!_changes[key])
      _changes[key] = {}
    // Cached current cell value for toast rollback
    if (!_changes[key][column.field])
      _changes[key][column.field] = [currentValue]
    const origin = _changes[key][column.field]?.[0]
    // Clear new value if has same content
    if (origin === changedValue) {
      _changes[key][column.field]?.splice(1, 1)
    }
    // Set changed value as the second one and trigger undo toast
    else {
      _changes[key][column.field] = [origin, changedValue]
      triggerUndoToast(key, column.field, origin, row, col)
    }

    changes.value = _changes
  })

  instance.on('checkbox_state_change', ({ row, checked }): any => {
    if (row > 0) {
      const isTemp = row <= inserts.value.length
      const rowKey = instance.records[row - 1].__TABLITE_ROW_KEY
      if (!isTemp && !rowKey)
        return
      const key = isTemp ? row - 1 : rowKey
      if (checked)
        selectedRowRecord[key] = key
      else
        delete selectedRowRecord[key]

      selectedRowKeys.value = Object.values(selectedRowRecord)
      return
    }
    if (!checked) {
      selectedRowRecord = {}
      selectedRowKeys.value = []
    }
    else {
      selectedRowKeys.value = instance.records.map(({ __TABLITE_ROW_KEY }, index) => {
        const key = __TABLITE_ROW_KEY ?? index
        selectedRowRecord[key] = key
        return key
      })
    }
  })
})

function triggerUndoToast(key: string, field: string, origin: any, row: number, col: number) {
  toast('Field has been changed', {
    description: useDateFormat(useNow(), 'dddd, MMMM Mo HH:mma', { locales: 'en-US' }),
    action: {
      label: 'Undo',
      onClick() {
        if (!instance)
          return
        changes.value[key]?.[field]?.splice(1, 1)
        instance.changeCellValue(col, row, origin)
      },
    },
  })
}

watch(() => [props.records, props.primaryKeys], ([v0, v1]) => {
  if (v1?.length)
    originRecordKeys.value = v0!.map(i => generateRowKeyFromRecord(i))
})

watch(records, (v) => {
  selectedRowRecord = {}
  selectedRowKeys.value = []
  instance.setRecords(v)
})

watch(() => [props.columns, props.primaryKeys], () => {
  selectedRowKeys.value = []
  instance.updateColumns(columns.value as any)
})

watch(() => [props.changes, props.inserts, props.deletes], () => {
  selectedRowKeys.value = []
  instance.updateOption(options.value)
})

function isEmpty(value: any) {
  return ['', undefined, null].includes(value)
}

function hasChanged(x: number, y: number) {
  if (!props.editable || !instance)
    return false
  const key = instance.records[y - 1]?.__TABLITE_ROW_KEY
  if (!key)
    return false
  const column = columns.value[x]
  if (!column)
    return false
  const his = changes.value[key]?.[column.field] ?? []
  return his.length > 1
}

function hasDeleted(y: number) {
  if (!props.editable || !instance)
    return false
  const key = instance.records[y - 1]?.__TABLITE_ROW_KEY
  return props.deletes.includes(key)
}

function generateRowKeyFromRecord(record: any) {
  const keys: Record<string, any> = {}
  props.primaryKeys.forEach((k) => {
    keys[k] = record[k]
  })
  return JSON.stringify(keys)
}

function calcCellBgColor(col: number, row: number) {
  if (row <= inserts.value.length)
    return '#fef9c3'
  if (hasDeleted(row))
    return '#fee2e2'
  if (hasChanged(col, row))
    return '#fef9c3'
  return !(row & 1) ? '#fafafa' : '#ffffff'
}
</script>

<template>
  <div ref="domRef" class="w-full h-full flex-1 shrink-0 text-xs" />
</template>
