export interface UseSelectOptions {
  where?: MaybeRef<string>
  limit?: MaybeRef<number>
  offset?: MaybeRef<number>
}

export function useSelect(columns: MaybeRef<string[]>, from: MaybeRef<string>, options: UseSelectOptions = {}) {
  const _where = toRef(options.where)
  const _limit = toRef(options.limit)
  const _offset = toRef(options.offset)

  const sql = computed(() => [
    'SELECT',
    unref(columns).join(', ') || '*',
    'FROM',
    `\`${unref(from)}\``,
    _where.value ? ['WHERE', _where.value] : undefined,
    _limit.value ? ['LIMIT', _limit.value] : undefined,
    _offset.value ? ['OFFSET', _offset.value] : undefined,
  ].flat().join(' '))

  return {
    sql,
  }
}
