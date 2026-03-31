import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf8')
const getEnv = (key) => {
  const match = envFile.match(new RegExp(`${key}=(.*)`))
  return match ? match[1].trim() : ''
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()
  if (usersError) return console.error(usersError)

  const adminUser = usersData.users.find(u => u.email === 'gui.devwork@gmail.com')
  if (!adminUser) {
    return console.log('Usuário gui.devwork@gmail.com não encontrado na auth.users do Supabase.')
  }

  // Update directly on profiles
  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('id', adminUser.id)

  if (error) {
    console.error('Erro ao atualizar profiles:', error)
  } else {
    console.log(`Sucesso! Usuário ${adminUser.id} agora é Admin!`)
  }
}

run()
