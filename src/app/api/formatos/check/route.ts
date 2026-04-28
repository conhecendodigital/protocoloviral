import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const urlStr = searchParams.get('url')

    if (!urlStr) {
      return NextResponse.json({ error: 'URL parameter expected' }, { status: 400 })
    }

    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Tenta extrair o ID único do vídeo para fazer uma busca hiper-robusta (ignora mobile vs web, wwww vs sem www)
    const getCoreId = (u: string) => {
      const ig = u.match(/(?:reel|p|reels)\/([A-Za-z0-9_-]+)/);
      if (ig) return ig[1];
      const tt = u.match(/video\/(\d+)/);
      if (tt) return tt[1];
      const yt = u.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})/);
      if (yt) return yt[1];
      return null;
    }

    const videoId = getCoreId(urlStr);
    const normalizedUrl = urlStr.split('?')[0].replace(/\/$/, '')

    let query = supabase.from('formatos').select('id, link_original, created_at')
    if (videoId) {
      query = query.ilike('link_original', `%${videoId}%`)
    } else {
      query = query.ilike('link_original', `${normalizedUrl}%`)
    }

    const { data: formato } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (formato) {
      return NextResponse.json({
        status: 'completed',
        id: formato.id
      })
    }

    return NextResponse.json({
      status: 'pending'
    })

  } catch (error: any) {
    console.error('[CHECK_POLLING_ERROR]', error)
    return NextResponse.json({ error: 'Falha temporária ao checar o status. Nosso servidor está se recuperando, aguarde...' }, { status: 500 })
  }
}
