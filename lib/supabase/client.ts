// Simple Supabase client implementation without SSR package
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return {
    auth: {
      async getUser() {
        // For now, return no user to avoid auth issues
        return { data: { user: null }, error: null }
      },
      async signInWithPassword(credentials: { email: string; password: string }) {
        try {
          const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseKey,
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })
          const data = await response.json()
          return { data, error: response.ok ? null : data }
        } catch (error) {
          return { data: null, error }
        }
      },
      async signUp(credentials: { email: string; password: string; options?: any }) {
        try {
          const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseKey,
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })
          const data = await response.json()
          return { data, error: response.ok ? null : data }
        } catch (error) {
          return { data: null, error }
        }
      },
      async signOut() {
        return { error: null }
      },
    },
    from(table: string) {
      return {
        select(columns = "*") {
          return {
            async eq(column: string, value: any) {
              try {
                const response = await fetch(
                  `${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}&select=${columns}`,
                  {
                    headers: {
                      apikey: supabaseKey,
                      Authorization: `Bearer ${supabaseKey}`,
                    },
                  },
                )
                const data = await response.json()
                return { data, error: response.ok ? null : data }
              } catch (error) {
                return { data: null, error }
              }
            },
            async single() {
              return { data: null, error: null }
            },
          }
        },
        async insert(values: any) {
          try {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify(values),
            })
            const data = await response.json()
            return { data, error: response.ok ? null : data }
          } catch (error) {
            return { data: null, error }
          }
        },
      }
    },
  }
}

export function createBrowserClient() {
  return createClient()
}
