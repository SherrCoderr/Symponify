import {
  Accessibility,
  BookOpen,
  CalendarDays,
  Check,
  Cloud,
  Code2,
  Disc3,
  FileText,
  Flame,
  Globe2,
  Headphones,
  Heart,
  ImageIcon,
  Library,
  ListMusic,
  Mail,
  MapPin,
  MessageCircle,
  Mic2,
  Moon,
  Music,
  Palette,
  Search,
  Sparkles,
  Target,
  UploadCloud,
  Zap,
} from 'lucide-react'

export const iconMap = {
  accessibility: Accessibility,
  book: BookOpen,
  calendar: CalendarDays,
  check: Check,
  cloud: Cloud,
  disc: Disc3,
  fileText: FileText,
  flame: Flame,
  github: Code2,
  globe: Globe2,
  headphones: Headphones,
  heart: Heart,
  image: ImageIcon,
  library: Library,
  listMusic: ListMusic,
  mail: Mail,
  mapPin: MapPin,
  message: MessageCircle,
  mic: Mic2,
  moon: Moon,
  music: Music,
  palette: Palette,
  search: Search,
  sparkles: Sparkles,
  target: Target,
  upload: UploadCloud,
  zap: Zap,
}

export function SvgIcon({ name = 'music', size = 20, strokeWidth = 2, style, ...props }) {
  const Icon = iconMap[name] || Music
  return <Icon aria-hidden="true" size={size} strokeWidth={strokeWidth} style={style} {...props} />
}

export default function IconBadge({
  name = 'music',
  size = 22,
  iconSize,
  color = 'var(--accent)',
  background = 'var(--accent-soft)',
  className = '',
  style,
}) {
  return (
    <span
      className={className}
      style={{
        width: size * 2,
        height: size * 2,
        borderRadius: Math.max(12, size * 0.75),
        display: 'inline-grid',
        placeItems: 'center',
        background,
        color,
        flexShrink: 0,
        ...style,
      }}
    >
      <SvgIcon name={name} size={iconSize || size} />
    </span>
  )
}
