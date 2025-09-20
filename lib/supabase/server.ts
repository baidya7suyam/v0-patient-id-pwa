// Simple server-side Supabase client
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return {
    auth: {
      async getUser() {
        // For now, return no user to avoid auth issues
        return { data: { user: null }, error: null }
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
      }
    },
  }
}

export async function createServerClient() {
  return createClient()
}
