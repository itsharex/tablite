<script setup lang="ts">
import { hash } from 'ohash'

const store = useSettingsStore()
const { language, alias, tags, googleAPIKey, deepseekApiKey, openrouterApiKey, model } = storeToRefs(store)
const { connections } = storeToRefs(useConnectionStore())

const id = useRouteParams<string>('id')
const cnx = computed<Partial<Connection>>(() => connections.value.find(({ url }) => hash(url) === id.value) ?? {})
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

      <div class="p-8 flex flex-1 max-w-xl flex-col gap-8">
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

        <div v-if="[googleAPIKey, deepseekApiKey, openrouterApiKey].filter(Boolean).length">
          <div class="text-sm font-semibold mb-2">
            Assistant
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

              <SelectSeparator />

              <SelectGroup v-if="deepseekApiKey">
                <SelectLabel class="cursor-default">
                  DeepSeek
                </SelectLabel>
                <SelectItem v-for="m in DEEPSEEK_MODELS" :key="m.model" :value="m.model">
                  {{ m.alias }}
                </SelectItem>
              </SelectGroup>

              <SelectSeparator />

              <SelectGroup v-if="openrouterApiKey">
                <SelectLabel class="cursor-default">
                  OpenRouter
                </SelectLabel>
                <SelectItem v-for="m in OPENROUTER_MODELS" :key="m.model" :value="m.model">
                  <div class="flex items-center gap-2">
                    {{ m.alias }}

                    <Badge v-if="m.tag" class="h-4 px-2 text-[0.5rem] uppercase">
                      {{ m.tag }}
                    </Badge>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div class="text-sm font-semibold mb-2">
            Label
          </div>

          <div class="text-xs text-zinc-600/50 mb-4 cursor-default">
            Renders an accessible label associated with controls
          </div>

          <Input v-model="alias" class="text-sm h-8" />
        </div>

        <div>
          <div class="text-sm font-semibold mb-2">
            Tags
          </div>

          <div class="text-xs text-zinc-600/50 mb-4 cursor-default">
            Tag inputs render tags inside an input, followed by an actual text input
          </div>

          <TagsInput v-model="tags" class="h-8 py-0 px-2">
            <TagsInputItem v-for="item in tags" :key="item" :value="item" class="flex items-center h-5">
              <TagsInputItemText class="text-xs" />
              <TagsInputItemDelete class="w-3" />
            </TagsInputItem>

            <TagsInputInput class="text-sm" />
          </TagsInput>
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

      <div class="p-8 flex flex-1 max-w-xl flex-col gap-8">
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
            OpenRouter
          </div>

          <div class="text-xs text-zinc-600/50 mb-4 cursor-default">
            <div>To use tablite assistant with OpenRouter you need to add an API key. Follow these steps:</div>
            <div>
              Create one by visiting <Button variant="link" class="text-xs p-0 h-4 text-zinc-600 font-normal">
                https://openrouter.ai/settings/keys
              </Button>
            </div>
            <div>Paste your API key below and hit enter to use the assistant</div>
          </div>

          <Input v-model="openrouterApiKey" type="password" class="text-sm h-8" placeholder="sk-..." />
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

    <Separator />

    <div class="flex">
      <div class="p-8 w-96 flex-shrink-0">
        <div class="text-lg font-bold mb-1">
          Danger Zone
        </div>
        <div class="text-xs text-zinc-600/50">
          Proceed with caution and ensure full understanding of consequences
        </div>
      </div>

      <div class="p-8 flex flex-1 max-w-xl flex-col gap-8">
        <div>
          <div class="text-sm font-semibold mb-4">
            URL string
          </div>

          <div class="flex items-center gap-2">
            <Input :model-value="cnx?.url" class="text-sm h-8" disabled />
          </div>
        </div>

        <div>
          <div class="text-sm font-semibold mb-2">
            Delete this connection
          </div>

          <div class="text-xs text-zinc-600/50 mb-4 cursor-default">
            Once you delete a connection, there is no going back. Please be certain.
          </div>

          <Button variant="destructive">
            Delete this connection
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
