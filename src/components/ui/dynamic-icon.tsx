'use client'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CSSProperties } from 'react'

// Maps Material Symbol names → Lucide component names
const MATERIAL_TO_LUCIDE: Record<string, string> = {
  home: 'Home', map: 'Map', explore: 'Compass', pin_drop: 'MapPin',
  target: 'Target', add: 'Plus', close: 'X', check: 'Check',
  check_circle: 'CheckCircle', task_alt: 'CheckCircle2', done: 'Check',
  delete: 'Trash2', edit: 'Pencil', edit_note: 'FileEdit', save: 'Save',
  refresh: 'RefreshCw', autorenew: 'RefreshCw', restart_alt: 'RotateCcw',
  sync: 'RefreshCw', swap_horiz: 'ArrowLeftRight', content_copy: 'Copy',
  open_in_new: 'ExternalLink', link: 'Link', logout: 'LogOut',
  search: 'Search', search_off: 'SearchX', unfold_more: 'ChevronsUpDown',
  arrow_forward: 'ArrowRight', arrow_back: 'ArrowLeft', arrow_upward: 'ArrowUp',
  chevron_right: 'ChevronRight', chevron_left: 'ChevronLeft', expand_more: 'ChevronDown',
  description: 'FileText', subject: 'AlignLeft', folder_open: 'FolderOpen',
  library_books: 'BookOpen', format_quote: 'Quote', text_fields: 'Type',
  code: 'Code2', badge: 'BadgeCheck', play_circle: 'PlayCircle',
  video_library: 'VideoIcon', videocam: 'Video', video_camera_back: 'Camera',
  photo_camera: 'Camera', mic: 'Mic', record_voice_over: 'Mic2',
  view_carousel: 'LayoutDashboard', movie_filter: 'Clapperboard',
  phone_iphone: 'Smartphone', forum: 'MessageSquare', notifications: 'Bell',
  notifications_off: 'BellOff', mail: 'Mail', waving_hand: 'Hand',
  error: 'AlertCircle', warning: 'AlertTriangle', pending: 'Clock3',
  verified: 'BadgeCheck', star: 'Star', favorite: 'Heart', bolt: 'Zap',
  flare: 'Sparkles', whatshot: 'Flame', local_fire_department: 'Flame',
  smart_toy: 'Bot', psychology: 'Brain', neurology: 'Brain', memory: 'Cpu',
  auto_awesome: 'Sparkles', lightbulb: 'Lightbulb',
  insights: 'TrendingUp', monitoring: 'BarChart3', analytics: 'BarChart3',
  trending_up: 'TrendingUp', person: 'User', person_pin: 'UserCheck',
  groups: 'Users', settings: 'Settings', tune: 'SlidersHorizontal',
  schedule: 'Clock', timer: 'Timer', calendar_today: 'Calendar',
  history: 'History', lock: 'Lock', cloud_upload: 'CloudUpload',
  visibility: 'Eye', visibility_off: 'EyeOff', progress_activity: 'Loader2',
  rocket_launch: 'Rocket', category: 'LayoutGrid', anchor: 'Anchor',
  calculate: 'Calculator', workspace_premium: 'Crown', crown: 'Crown',
  sentiment_dissatisfied: 'Frown', alternate_email: 'AtSign',
  robot_2: 'Bot', attach_file: 'Paperclip', block: 'Ban',
  chat: 'MessageCircle', chat_bubble: 'MessageCircle', auto_fix_high: 'Wand2',
  video_camera_front: 'Camera', amp_stories: 'Layers',
  emoji_objects: 'Lightbulb', tips_and_updates: 'Lightbulb',
  trip_origin: 'Circle', magic_button: 'Wand2', smart_button: 'Wand2',
  toggle_on: 'ToggleRight', cloud_done: 'CloudCheck',
}

interface DynamicIconProps {
  name: string
  size?: number
  className?: string
  style?: CSSProperties
}

/**
 * DynamicIcon — renders a Lucide icon from a Material Symbol string name.
 * Use when icon name comes from a database/variable (data-driven icons).
 *
 * @example
 * <DynamicIcon name={formato.icone} size={20} className="text-sky-500" />
 */
export function DynamicIcon({ name, size = 18, className, style }: DynamicIconProps) {
  const lucideName = MATERIAL_TO_LUCIDE[name] || 'HelpCircle'
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[lucideName]

  if (!Icon) {
    return <span className={className} style={{ width: size, height: size, display: 'inline-block', ...style }} />
  }

  return <Icon size={size} className={className} style={style} />
}
