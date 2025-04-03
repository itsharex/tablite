import { SelectSeparator } from '#components'

export default defineComponent({
  setup(_, { slots }) {
    const doms = () => flatSlots(slots.default?.())

    const isLast = (index: number) => index === (doms()?.length ?? 0) - 1

    return () => doms().map((item, index) => {
      return (
        <>
          {item}
          {!isLast(index) && <SelectSeparator />}
        </>
      )
    })
  },
})
