<template>
  <Drawer>
    <div class="flex flex-col box-border px-10 py-16">
      <div class="flex items-center justify-between mb-10">
        <div class="text-xl font-semibold cursor-default">
          Bases
        </div>

        <DrawerTrigger>
          <Button>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 mr-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>

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

    <DrawerContent>
      <DrawerHeader class="cursor-default">
        <DrawerTitle>Create a base</DrawerTitle>
        <DrawerDescription>Connect to a database</DrawerDescription>
      </DrawerHeader>

      <div class="grid grid-cols-4 gap-4 px-4">
        <CardSpotlight
          class="cursor-pointer p-6 box-border items-center"
          gradient-color="#C9C9C9"
        >
          <div class="flex items-center gap-3">
            <div class="size-6">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.2913 4V5.71435H12.0057L12.0046 10.8572L10.2913 10.857V12.5714H13.719V5.71435L18.8535 5.71453V14.2857H17.1435V12.5714H15.4292V14.2857H13.7169V17.7144L12.0046 17.7142L12.0057 16.0001H10.2913V19.4286H15.4313V14.2857H17.1414V16.0001H20.5679V14.2857V5.71453L18.8557 5.71435V4H10.2913Z" fill="currentColor" /><path d="M20.5679 14.2857H22.2824V17.7144H20.568L20.5679 16.0001V14.2857Z" fill="currentColor" /><path d="M15.4292 9.05726H17.1435V10.7716H15.4292V9.05726Z" fill="currentColor" /><path d="M10.2881 14.2857H8.5737V16.0001H10.2881V14.2857Z" fill="currentColor" /><path d="M6.85606 14.2857H8.57043V16.0001H6.85606V14.2857Z" fill="currentColor" /><path d="M6.85265 16.0001H5.13828V17.7144L3.42663 17.7142V9.14286L5.13885 9.14304V7.4287L6.85265 7.42888V5.71453H5.13828L5.13885 7.4287H3.42448V9.14304L1.71226 9.14286V10.857H0V12.5714H1.71226V19.4286H6.85265V16.0001Z" fill="currentColor" /><path d="M8.57043 5.71453H6.85606V7.42888H8.57043V5.71453Z" fill="currentColor" /><path d="M24 16.0001H22.2856V17.7144H24V16.0001Z" fill="currentColor" /><path d="M8.5737 10.8572H10.2881V5.71453H8.5737V10.8572Z" fill="currentColor" /></svg>
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
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.33511 2H11.2611V3.46667H9.80179V6.39967H8.33511V2Z" fill="currentColor" /><path d="M11.2666 3.4665H12.7333V4.93317H11.2666V3.4665Z" fill="currentColor" /><path d="M12.739 4.933V6.39967H15.6647V4.933H12.739Z" fill="currentColor" /><path d="M17.1371 4.933H15.6704V6.39967H17.1295V7.86633H18.5962V6.39967H17.1371V4.933Z" fill="currentColor" /><path d="M18.6018 7.86683H20.0685V9.3335L21.5277 9.33333V10.8H18.6018V7.86683Z" fill="currentColor" /><path d="M23 10.8H21.5333V12.2667H23V10.8Z" fill="currentColor" /><path d="M21.5277 12.2667H18.6018V13.7333H21.5277V12.2667Z" fill="currentColor" /><path d="M15.6704 9.33333H17.1371V10.8H15.6704V9.33333Z" fill="currentColor" /><path d="M8.32965 4.933H6.86297V6.39967H5.40363V7.86633H6.87031V6.39967H8.32965V4.933Z" fill="currentColor" /><path d="M5.39812 7.86683H3.93144V9.3335L2.47219 9.33333V10.8H3.93887V9.33333L5.39812 9.3335V7.86683Z" fill="currentColor" /><path d="M2.46668 10.8H1V15.1997H2.46668V10.8Z" fill="currentColor" /><path d="M2.47219 18.1328H3.93887V15.1995H2.47219V18.1328Z" fill="currentColor" /><path d="M3.93144 21.0667V18.1335H5.39812V21.0667H3.93144Z" fill="currentColor" /><path d="M6.86297 21.0667H5.40363V22.5333H6.87031V21.0667H8.32965V19.6H6.86297V21.0667Z" fill="currentColor" /><path d="M9.80179 18.1335H8.33511V19.6002H9.80179V18.1335Z" fill="currentColor" /><path d="M6.87031 16.6662H8.32965V18.1328H5.40363V13.733L6.86297 13.7333V12.2667H8.32965V13.7333L6.87031 13.733V16.6662Z" fill="currentColor" /><path d="M8.33511 16.6662H11.2611V15.1995L9.80179 15.1997V10.8H8.33511V16.6662Z" fill="currentColor" /><path d="M18.5962 12.2667V13.7333H15.6704V12.2667H18.5962Z" fill="currentColor" /><path d="M15.6647 12.2667V15.1997L14.2056 15.1995V16.6662H12.739V15.1995L14.198 15.1997V13.7333H12.739V12.2667H15.6647Z" fill="currentColor" /><path d="M11.2666 13.733H12.7333V15.1997H11.2666V13.733Z" fill="currentColor" /></svg>
            </div>
            <span class="font-semibold">MySQL</span>
          </div>
        </CardSpotlight>
      </div>

      <DrawerFooter />
    </DrawerContent>
  </Drawer>
</template>
