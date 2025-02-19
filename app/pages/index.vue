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

      <Separator v-if="connections.length" class="my-8" />

      <div class="grid gap-7 grid-cols-2">
        <Card v-for="c in connections" :key="c.url" class="cursor-pointer p-4 transition-all duration-150 hover:bg-zinc-100" @click="onConnectByHash(c.url)">
          <div class="fade flex animate-fade items-center gap-2.5">
            <div class="flex size-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-800 text-white">
              <DbLogo :value="c.url.split('://')[0]" class="size-6" />
            </div>
            <div class="w-0 justify-between flex-1">
              <CardTitle class="text-sm mb-1">
                <div class="truncate">
                  {{ c.alias ?? c.url.split('://')[1] }}
                </div>
              </CardTitle>
              <CardDescription class="mt-px">
                <div class="origin-top-left uppercase flex items-center gap-1">
                  <Badge variant="outline" class="h-4 px-2 text-[0.5rem]">
                    {{ c.url.split('://')[0] }}
                  </Badge>
                  <Badge v-for="t in c.tags" :key="[c.url, t].join(':')" variant="outline" class="h-4 px-2 text-[0.5rem]">
                    {{ t }}
                  </Badge>
                </div>
              </CardDescription>
            </div>
            <Spin v-if="isCnxLoading[c.url]" class="size-4" />
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
