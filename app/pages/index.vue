<script setup lang="ts">
import { toast } from 'vue-sonner'
import CircleStack from '~icons/heroicons/circle-stack'
import PaperAirplane from '~icons/heroicons/paper-airplane'

const router = useRouter()
const { url, isInvalidate, connect } = useConnection()
const store = useConnectionStore()
const { connections, isLoading } = storeToRefs(store)

async function onConnectByURL() {
  try {
    const hash = await connect()
    router.replace({ name: 'id-tables', params: { id: hash } })
  }
  catch (error) {
    toast('SQLX', { description: String(error) })
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

        <div class="grid gap-4 grid-cols-2">
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

      <div class="grid gap-4 grid-cols-2">
        <ConnectionCard
          v-for="(cnx, index) in connections"
          :key="cnx.url"
          :index="index"
          :url="cnx.url"
          :tags="cnx.tags"
          :alias="cnx.alias"
        />
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
