<script setup lang="ts">
import { Input } from '~/components/ui/input'

const store = useSettingsStore()
const { language, googleAPIKey } = storeToRefs(store)
</script>

<template>
  <div class="px-4 w-full">
    <div class="flex">
      <div class="p-8 w-96 flex-shrink-0">
        <div class="text-lg font-bold mb-1">
          Gereral
        </div>
        <div class="text-xs text-zinc-600/50">
          Gereral settings userd in the application
        </div>
      </div>

      <div class="p-8 flex flex-col gap-8">
        <div>
          <div class="text-xs font-semibold mb-4">
            Language
          </div>

          <Select v-model="language" class="focus-visible:ring-0">
            <SelectTrigger class="h-8 text-xs w-32 flex-shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="en-US" class="text-xs">
                  English
                </SelectItem>
                <SelectItem value="zh-CN" class="text-xs">
                  简体中文
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div class="text-xs font-semibold mb-2">
            Google AI
          </div>

          <div class="text-xs text-zinc-600/50 mb-4 cursor-default">
            <div>To use tablite assistent with Google AI you need to add an API key. Follow these steps:</div>
            <div>
              Create one by visiting <Button variant="link" class="text-xs p-0 h-4 text-zinc-600 font-normal">
                https://aistudio.google.com/app/apikey
              </Button>
            </div>
            <div>Paste your API key below and hit enter to use the assistent</div>
          </div>

          <Input v-model="googleAPIKey" type="password" class="text-xs h-8" placeholder="AIzaSy..." />
        </div>

        <div>
          <div class="text-xs font-semibold mb-4">
            DeepSeek
          </div>

          <Input type="password" class="text-xs h-8" placeholder="sk-..." />
        </div>

        <div>
          <div class="text-xs font-semibold mb-2">
            OpenAI
          </div>

          <div class="text-xs text-zinc-600/50 mb-4 cursor-default">
            <div>To use tablite assistent with OpenAI you need to add an API key. Follow these steps:</div>
            <div>
              Create one by visiting <Button variant="link" class="text-xs p-0 h-4 text-zinc-600 font-normal">
                https://platform.openai.com/api-keys
              </Button>
            </div>
            <div>Ensure your OpenAI account has credits</div>
            <div>Paste your API key below and hit enter to start using the assistent</div>
          </div>

          <Input type="password" class="text-xs h-8" placeholder="sk-..." />
        </div>
      </div>
    </div>
  </div>
</template>
