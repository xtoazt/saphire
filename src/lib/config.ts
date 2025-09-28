// Configuration file for API keys and app settings
export const config = {
  googleApiKey: 'AIzaSyBGb5fGAyC-pRcRU6MUHb__b_vKha71HRE',
  llm7ApiKey: 's5Mrm8q/+LNSSZSsf1I0sL3bbs3zSiAdPlflRRw3tDOb/5siSOo+/I9O/F7yiWA5M7VARTBR01JynN8CweEM5mpJvwXySRr5n8vdwsZQp14YqZ2lpLC81XmUBS59C2FEH/Y6l+4VKvSee6tHsq0=',
  llm7BaseUrl: 'https://api.llm7.io/v1',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;
