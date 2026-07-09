import { useEffect, useState } from 'react'
import { SvgIcon } from './IconBadge'

export default function CoverArt({ src, alt, fallback, imgStyle, containerStyle }) {
  const [failed, setFailed] = useState(false)
  const hasSrc = Boolean(src) && !failed

  useEffect(() => {
    setFailed(false)
  }, [src])

  return (
    <div style={containerStyle}>
      {hasSrc ? (
        <img
          src={src}
          alt={alt}
          style={imgStyle}
          loading="lazy"
          onError={() => {
            setFailed(true)
          }}
        />
      ) : typeof fallback === 'string' || !fallback ? (
        <SvgIcon name="disc" size={28} />
      ) : (
        fallback
      )}
    </div>
  )
}
