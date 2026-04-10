const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vskmryemztaalmrftlpo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZza21yeWVtenRhYWxtcmZ0bHBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTcwNjE4MCwiZXhwIjoyMDg1MjgyMTgwfQ.H31MPM6QvUplC1TVLVOwo0VjTTHiHogiPEA7_CnIjmI'
);

async function run() {
  const { data: agents, error: err } = await supabase.from('agents').select('user_id').limit(1);
  
  if (err || !agents || agents.length === 0) {
    console.error('No users found in agents', err);
    return;
  }

  const userId = agents[0].user_id;

  const dummyScript = `**Como Ganhar 10k Seguidores em 30 Dias**

[GANCHO]
Você sabia que 90% dos criadores iniciantes desistem antes de atingir os 10k seguidores? O segredo não é viralizar, é consistência.

[DESENVOLVIMENTO]
Primeiro, parecendo contraintuitivo, pare de postar todos os dias e passe a postar a cada dois dias, mas com 2x mais qualidade e uma estrutura clara. Segundo, analise a retenção. Se nos primeiros 3 segundos o usuário rola a tela para tentar advinhar o que você vai falar depois, mude o começo. Terceiro, use ganchos abertos.

[CHAMADA PARA AÇÃO]
Se você quer as 5 estruturas de roteiro exatas que eu usei para chegar em 100k seguidores sem dancinhas, digita "ESTRUTURA" aqui nos comentários que eu te mando no direct agora mesmo!`;

  const { error } = await supabase.from('roteiros').insert({
    user_id: userId,
    roteiro: dummyScript,
    titulo: 'VVS - Script Ganhar Seguidores',
    nicho: 'Crescimento / Marketing',
    formato_nome: 'Listicle Direto'
  });

  if (error) {
    console.error('Error inserting dummy script', error);
  } else {
    console.log('Dummy script successfully inserted for user:', userId);
  }
}

run();
