const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config({ path: './.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fetchFormatos() {
  const { data, error } = await supabase
    .from('formatos')
    .select('*')
  
  if (error) {
    console.error('Error fetching formatos:', error)
    return
  }

  console.log(JSON.stringify(data, null, 2))
}

fetchFormatos()
