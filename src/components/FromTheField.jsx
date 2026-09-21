import mansanpallyThumb from '../assets/plots-pulse/mansanpally.jpg'
import kokapetThumb from '../assets/plots-pulse/kokapet.jpg'
import nallagandlaThumb from '../assets/plots-pulse/nallagandla.jpg'
import defaultProfile from '../assets/about-panel/hero-property.jpg'
import './FromTheField.css'

const DEFAULT_REELS = [
  {
    thumbnail: mansanpallyThumb,
    title: 'Plot A3',
    location: 'Mansanpally',
    duration: '0:42',
    reelUrl: 'https://www.instagram.com/ila_homes/',
  },
  {
    thumbnail: kokapetThumb,
    title: 'Corner plot walk',
    location: 'Kokapet Heights',
    duration: '0:58',
    reelUrl: 'https://www.instagram.com/ila_homes/',
  },
  {
    thumbnail: nallagandlaThumb,
    title: 'Road-facing lot',
    location: 'Nallagandla',
    duration: '0:36',
    reelUrl: 'https://www.instagram.com/ila_homes/',
  },
]

function PlayIcon() {
  return (
    <svg className="from-field__play-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.22)" />
      <path d="M10 8.5v7l6-3.5-6-3.5z" fill="#fff" />
    </svg>
  )
}

export default function FromTheField({
  reels = DEFAULT_REELS,
  handle = '@ila_homes',
  profileUrl = 'https://www.instagram.com/ila_homes/',
  profileImage = defaultProfile,
  followers = '26K+',
  reelCount = '50+',
}) {
  return (
    <section className="from-field" aria-labelledby="from-field-heading">
      <div className="from-field__frame">
        <header className="from-field__intro">
          <p className="from-field__eyebrow">From the field</p>
          <h2 id="from-field-heading" className="from-field__heading">
            Hear it straight from the ground
          </h2>
          <p className="from-field__lede">Short walkthroughs. Real plots. No filters.</p>
        </header>

        <div className="from-field__grid">
          <div className="from-field__reels" role="list">
            {reels.map((reel) => {
              const label = `${reel.location} · ${reel.title}`
              return (
                <a
                  key={`${reel.location}-${reel.title}`}
                  className="from-field__card"
                  href={reel.reelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="listitem"
                  aria-label={`Watch reel: ${label}`}
                >
                  <img
                    className="from-field__thumb"
                    src={reel.thumbnail}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                  />
                  <span className="from-field__duration">{reel.duration}</span>
                  <span className="from-field__play" aria-hidden="true">
                    <PlayIcon />
                  </span>
                  <span className="from-field__tag">{label}</span>
                </a>
              )
            })}
          </div>

          <aside className="from-field__profile" aria-label="Instagram profile">
            <div className="from-field__avatar-wrap">
              <img
                className="from-field__avatar"
                src={profileImage}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
            <p className="from-field__ig-handle">{handle}</p>
            <p className="from-field__ig-bio">
              Follow for weekly plot walkthroughs, location updates &amp; investment tips.
            </p>
            <a
              className="from-field__cta"
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow on Instagram
            </a>
            <p className="from-field__stats">
              {followers} Followers
              <span aria-hidden="true"> · </span>
              {reelCount} Reels
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}
