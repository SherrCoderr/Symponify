import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useViewport from '../hooks/useViewport'
import CoverArt from './CoverArt'
import { useReducedMotion } from '../lib/animation-utils'
import { SvgIcon } from './IconBadge'

const Icon = ({ name, size = 20, style: extraStyle }) => (
  <SvgIcon name={name} size={size} style={extraStyle} />
)

export default function AlbumCard({ album, onSelect, active = false, onOpen, compact = false }) {
  const navigate = useNavigate()
  const { isMobile, isWide } = useViewport()
  const prefersReducedMotion = useReducedMotion()

  const handleClick = () => {
    if (onSelect) {
      onSelect(album)
      return
    }

    if (onOpen) {
      onOpen(album)
      return
    }

    navigate(`/home/search?q=${encodeURIComponent(album.title)}`)
  }

  const hoverVariants = prefersReducedMotion ? {} : {
    hover: {
      y: -6,
      scale: 1.02,
      transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
    }
  }

  return (
    <motion.button
      type="button"
      style={{
        ...styles.card,
        flexDirection: compact ? 'row' : styles.card.flexDirection,
        alignItems: compact ? 'center' : undefined,
        opacity: active ? 1 : 0.96,
        padding: compact ? '10px' : isMobile ? '10px' : '14px',
        gap: compact ? '12px' : isWide ? '0.5rem' : styles.card.gap,
        background: active ? 'var(--surface-elevated)' : 'var(--card-bg)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--line)',
        borderRadius: compact ? '18px' : '24px',
        boxShadow: active ? '0 16px 34px rgba(255, 85, 0, 0.18)' : 'var(--shadow-soft)',
      }}
      onClick={handleClick}
      whileHover="hover"
      variants={hoverVariants}
      initial="initial"
    >
      <div style={{ ...styles.artContainer, width: compact ? '64px' : styles.artContainer.width, height: compact ? '64px' : undefined, aspectRatio: compact ? 'auto' : styles.artContainer.aspectRatio, flexShrink: compact ? 0 : undefined }}>
        <CoverArt
          src={album.coverUrl}
          alt={`${album.title} cover`}
          containerStyle={{
            ...styles.art,
            width: compact ? '64px' : styles.art.width,
            height: compact ? '64px' : undefined,
            aspectRatio: compact ? 'auto' : styles.art.aspectRatio,
            borderRadius: compact ? '14px' : styles.art.borderRadius,
            marginBottom: compact ? 0 : styles.art.marginBottom,
            background: album.coverUrl ? 'var(--surface-2)' : album.color || 'linear-gradient(135deg, #333, #666)',
            outline: active ? '3px solid var(--accent)' : 'none',
            fontSize: isMobile ? '34px' : isWide ? '46px' : styles.art.fontSize,
          }}
          imgStyle={styles.image}
          fallback={<SvgIcon name="disc" size={32} />}
        />
        <motion.div 
          style={styles.playOverlay}
          variants={{
            initial: { opacity: 0 },
            hover: { opacity: 1, transition: { duration: 0.2 } }
          }}
        >
          <div style={{ ...styles.playButton, width: compact ? '36px' : styles.playButton.width, height: compact ? '36px' : styles.playButton.height }}>
            <Icon name="play_arrow" size={compact ? 20 : 28} />
          </div>
        </motion.div>
      </div>
      {compact ? (
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ ...styles.title, WebkitLineClamp: 1 }}>{album.title}</div>
          <div style={{ ...styles.artist, WebkitLineClamp: 1 }}>{album.artist || 'Symponify Radio'}</div>
        </div>
      ) : (
        <>
          <div style={styles.title}>{album.title}</div>
          <div style={styles.artist}>{album.artist || 'Symponify Radio'}</div>
        </>
      )}
    </motion.button>
  )
}

const styles = {
  card: {
    width: '100%',
    minWidth: 0,
    textAlign: 'left',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  art: {
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: '20px',
    display: 'grid',
    placeItems: 'center',
    fontSize: '42px',
    marginBottom: '12px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
    overflow: 'hidden',
    position: 'relative',
  },
  artContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1 / 1',
  },
  playOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '20px',
    display: 'grid',
    placeItems: 'center',
    zIndex: 2,
  },
  playButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'var(--accent-gradient)',
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 8px 24px rgba(255, 122, 0, 0.36)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
  },
  title: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--text)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'normal',
    lineHeight: 1.3,
  },
  artist: {
    fontSize: '12px',
    color: 'var(--text-3)',
    marginTop: '4px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'normal',
    lineHeight: 1.4,
  },
}
