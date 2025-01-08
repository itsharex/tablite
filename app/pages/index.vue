<script setup lang="ts">
import CircleStack from '~icons/heroicons/circle-stack'
import PaperAirplane from '~icons/heroicons/paper-airplane'

const router = useRouter()
const { url, isInvalidate, isPending, connect } = useConnection()
const store = useConnectionStore()
const { connections } = storeToRefs(store)

const normalizations = computed(() => {
  return connections.value.map(({ id, url }) => ({ id, origin: url, url: new URL(url) }))
})

async function onConnectByURL() {
  const id = await connect()
  router.push({ path: `/${id}/tables` })
}

async function onConnectById(id: string, url: string) {
  await store.connect(url)
  router.push({ path: `/${id}/tables` })
}
</script>

<template>
  <Drawer>
    <div class="flex flex-col box-border py-16 mx-auto max-w-3xl">
      <div>
        <div class="flex items-center justify-between mb-10">
          <div class="text-xl font-semibold cursor-default">
            Bases
          </div>

          <DrawerTrigger>
            <Button>
              <CircleStack />

              New Base
            </Button>
          </DrawerTrigger>
        </div>

        <div class="grid gap-7 grid-cols-2">
          <GlowBorder class="p-0" :color="['#A07CFE', '#FE8FB5', '#FFBE7B']">
            <Card>
              <CardHeader>
                <CardTitle class="text-lg font-semibold">
                  Connect a database
                </CardTitle>
                <CardDescription>
                  Provide credentials to connect your database hosted elsewhere
                </CardDescription>
              </CardHeader>

              <CardFooter>
                <DrawerTrigger>
                  <Button variant="secondary" class="relative z-10">
                    Connect
                  </Button>
                </DrawerTrigger>
              </CardFooter>
            </Card>
          </GlowBorder>
        </div>
      </div>

      <Separator v-if="normalizations.length" class="my-8" />

      <div class="grid gap-7 grid-cols-2">
        <Card v-for="c in normalizations" :key="c.id" class="cursor-pointer p-4" @click="onConnectById(c.id, c.origin)">
          <div class="fade flex animate-fade items-center gap-2.5">
            <div class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-600 text-white">
              <MySQL class="size-6" />
            </div>
            <div>
              <CardTitle class="text-sm text-zinc-600">
                {{ c.url.host }}
              </CardTitle>
              <CardDescription class="text-xs">
                MySQL
              </CardDescription>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <DrawerContent class="px-10">
      <DrawerHeader class="cursor-default">
        <DrawerTitle>Create a base</DrawerTitle>
        <DrawerDescription>Connect to a database</DrawerDescription>
      </DrawerHeader>

      <div class="px-4">
        <div class="grid grid-cols-5 gap-4">
          <CardSpotlight
            class="cursor-pointer p-6 box-border items-center"
            gradient-color="#C9C9C9"
          >
            <div class="flex items-center gap-3">
              <div class="size-6">
                <Postgres />
              </div>
              <span class="font-semibold">Postgres</span>
            </div>
          </CardSpotlight>

          <CardSpotlight
            class="cursor-pointer p-6 box-border items-center"
            gradient-color="#C9C9C9"
          >
            <div class="flex items-center gap-3">
              <div class="size-6">
                <MySQL />
              </div>
              <span class="font-semibold">MySQL</span>
            </div>
          </CardSpotlight>
        </div>

        <Separator label="Or use a connection string" class="my-7" />

        <div class="flex w-full max-w-xl items-center gap-2">
          <Input v-model="url" placeholder="e.g. mysql://username:password@hostnmae:port/database" class="h-9" />
          <Button size="icon" :disabled="isInvalidate || isPending" @click="onConnectByURL">
            <PaperAirplane class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <DrawerFooter />
    </DrawerContent>
  </Drawer>
</template>
