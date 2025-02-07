<script setup lang="ts">
import { hash } from 'ohash'
import { toast } from 'vue-sonner'
import CircleStack from '~icons/heroicons/circle-stack'
import PaperAirplane from '~icons/heroicons/paper-airplane'

const router = useRouter()
const { url, isInvalidate, connect } = useConnection()
const store = useConnectionStore()
const { connections, isLoading } = storeToRefs(store)
const isCnxLoading = ref<Record<string, boolean>>({})

const normalizations = computed(() => {
  return connections.value.map(({ url: origin }) => {
    const [backend, path] = origin.split('://')

    if (backend === 'mysql')
      return { origin, backend, url: parseConnectionURL(origin) }
    if (backend === 'sqlite')
      return { origin, backend, url: { host: path } }

    return { origin, backend, url: {} }
  })
})

async function onConnectByURL() {
  const hash = await connect()
  router.replace({ name: 'id-tables', params: { id: hash } })
}

async function onConnectByHash(url: string) {
  if (isCnxLoading.value[url])
    return
  isCnxLoading.value[url] = true

  try {
    const id = hash(url)
    await store.connect(url)
    toast.dismiss()
    router.replace({ name: 'id-tables', params: { id } })
  }
  catch (error) {
    const options = { title: 'Warning', description: String(error) }

    if (typeof error === 'string') {
      const [_title, _description] = error.split(':').filter(Boolean).map(e => e.trim())

      options.title = _title ?? options.title
      options.description = _description ?? options.description
    }

    toast(options.title, { description: options.description })
  }
  finally {
    isCnxLoading.value[url] = false
  }
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
        <Card v-for="c in normalizations" :key="c.origin" class="cursor-pointer p-4 transition-all duration-150 hover:bg-zinc-100" @click="onConnectByHash(c.origin)">
          <div class="fade flex animate-fade items-center gap-2.5">
            <div class="flex size-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-800 text-white">
              <DbLogo :value="c.backend" class="size-6" />
            </div>
            <div class="w-0 flex-1">
              <CardTitle class="text-sm text-zinc-600">
                <div class=" truncate">
                  {{ c.url.host }}
                </div>
              </CardTitle>
              <CardDescription class="mt-px">
                <div class="scale-75 origin-top-left uppercase">
                  <Badge variant="outline">
                    {{ c.backend }}
                  </Badge>
                </div>
              </CardDescription>
            </div>
            <Spin v-if="isCnxLoading[c.origin]" class="size-4" />
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

          <CardSpotlight
            class="cursor-pointer p-6 box-border items-center"
            gradient-color="#C9C9C9"
          >
            <div class="flex items-center gap-3">
              <div class="size-6">
                <Sqlite />
              </div>
              <span class="font-semibold">Sqlite</span>
            </div>
          </CardSpotlight>
        </div>

        <Separator label="Or use a connection string" class="my-7" />

        <div class="flex w-full max-w-xl items-center gap-2">
          <Input v-model="url" placeholder="e.g. mysql://username:password@hostnmae:port/database" class="h-9" />
          <Button size="icon" :disabled="isInvalidate || isLoading" @click="onConnectByURL">
            <PaperAirplane class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <DrawerFooter />
    </DrawerContent>
  </Drawer>
</template>
