<script setup lang="ts">
import { Input } from '~/components/ui/input'

const store = useSettingsStore()
const { language, googleAPIKey, deepseekApiKey, model } = storeToRefs(store)
</script>

<template>
  <div class="px-4 w-full overflow-y-auto">
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
          <div class="text-sm font-semibold mb-4">
            Language
          </div>

          <Select v-model="language" class="focus-visible:ring-0">
            <SelectTrigger class="h-8 w-64 flex-shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="en-US">
                  English
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div class="text-sm font-semibold mb-2">
            Model
          </div>

          <div class="text-xs text-zinc-600/50 mb-4 cursor-default">
            Asking your database questions in natural language
          </div>

          <Select v-model="model" class="focus-visible:ring-0">
            <SelectTrigger class="h-8 w-64 flex-shrink-0">
              <SelectValue placeholder="Select a model..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup v-if="googleAPIKey">
                <SelectLabel class="cursor-default">
                  Google AI
                </SelectLabel>
                <SelectItem v-for="m in GOOGLE_AI_MODELS" :key="m.model" :value="m.model">
                  {{ m.alias }}
                </SelectItem>
              </SelectGroup>

              <SelectGroup v-if="deepseekApiKey">
                <SelectLabel class="cursor-default">
                  DeepSeek
                </SelectLabel>
                <SelectItem v-for="m in DEEPSEEK_MODELS" :key="m.model" :value="m.model">
                  {{ m.alias }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <Separator />

    <div class="flex">
      <div class="p-8 w-96 flex-shrink-0">
        <div class="text-lg font-bold mb-1">
          Assistant
        </div>
        <div class="text-xs text-zinc-600/50">
          At least one LLM provider must be configured to use assistant
        </div>
      </div>

      <div class="p-8 flex flex-col gap-8">
        <div>
          <div class="text-sm font-semibold mb-2">
            Google AI
          </div>

          <div class="text-xs text-zinc-600/50 mb-4 cursor-default">
            <div>To use tablite assistant with Google AI you need to add an API key. Follow these steps:</div>
            <div>
              Create one by visiting <Button variant="link" class="text-xs p-0 h-4 text-zinc-600 font-normal">
                https://aistudio.google.com/app/apikey
              </Button>
            </div>
            <div>Paste your API key below and hit enter to use the assistant</div>
          </div>

          <Input v-model="googleAPIKey" type="password" class="text-sm h-8" placeholder="AIzaSy..." />
        </div>

        <div>
          <div class="text-sm font-semibold mb-4">
            DeepSeek
          </div>

          <Input v-model="deepseekApiKey" type="password" class="h-8" placeholder="sk-..." />
        </div>

        <div>
          <div class="text-sm font-semibold mb-2">
            OpenAI
          </div>

          <div class="text-xs text-zinc-600/50 mb-4 cursor-default">
            <div>To use tablite assistant with OpenAI you need to add an API key. Follow these steps:</div>
            <div>
              Create one by visiting <Button variant="link" class="text-xs p-0 h-4 text-zinc-600 font-normal">
                https://platform.openai.com/api-keys
              </Button>
            </div>
            <div>Ensure your OpenAI account has credits</div>
            <div>Paste your API key below and hit enter to start using the assistant</div>
          </div>

          <Input type="password" class="h-8" placeholder="sk-..." />
        </div>
      </div>
    </div>
  </div>
</template>
