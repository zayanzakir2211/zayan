import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  ChevronDown,
  Clock3,
  CloudLightning,
  Code2,
  Crosshair,
  Facebook,
  Gauge,
  Github,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Network,
  Phone,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Terminal,
  Trophy,
  X,
} from 'lucide-react'

const HydraScene = lazy(() => import('./components/HydraScene'))

const projects = [
  {
    number: '01',
    title: 'IngreChec',
    description: 'AI ingredient analyzer powered by the Gemini API.',
    tags: ['AI', 'Gemini API'],
    year: '2026',
    url: 'https://ingrechec.online',
  },
  {
    number: '02',
    title: 'Deadhydra Web Toolbox',
    description: 'A focused encoding and decoding toolkit for the open web.',
    tags: ['Tools', 'JavaScript'],
    year: '2025',
    url: 'https://deadhydra.me',
  },
  {
    number: '03',
    title: 'CHAYA NGO Website',
    description: 'A clear, accessible non-profit site serving Kurigram.',
    tags: ['NGO', 'Performance'],
    year: '2025',
    url: 'https://chayabd.org',
  },
  {
    number: '04',
    title: 'Efat.me',
    description: 'A sharp, lightweight portfolio for a student builder.',
    tags: ['Portfolio', 'Static'],
    year: '2025',
    url: 'https://efat.me',
  },
  {
    number: '05',
    title: 'ThoughtDump',
    description: 'An AI mind-clarity journal designed to quiet mental noise.',
    tags: ['AI', 'Journaling'],
    year: '2025',
    url: 'https://thoughts-ejy.pages.dev',
  },
  {
    number: '06',
    title: 'Matchify',
    description: 'A university matching app that makes options easier to navigate.',
    tags: ['Education', 'App'],
    year: '2025',
    url: 'https://matchify-2t6.pages.dev',
  },
  {
    number: '07',
    title: 'Local Dhaka',
    description: 'A hyperlocal question-and-answer community for Dhaka.',
    tags: ['Community', 'Local'],
    year: '2025',
    url: 'https://localdhaka.pages.dev',
  },
  {
    number: '08',
    title: 'Deadhydra AI',
    description: 'A voice and text assistant built around Qwen 2.5.',
    tags: ['Qwen 2.5', 'Voice AI'],
    year: '2025',
    url: 'https://ai.deadhydra.me',
  },
  {
    number: '09',
    title: 'Action Figurez',
    description: 'A responsive e-commerce experience built for conversion.',
    tags: ['Commerce', 'Storefront'],
    year: '2025',
    url: 'https://actionfigurez.pages.dev',
  },
]

const skillGroups = [
  { title: 'Core', icon: Code2, skills: ['HTML5', 'CSS3', 'JavaScript', 'Node.js', 'MongoDB'] },
  {
    title: 'Platforms',
    icon: CloudLightning,
    skills: ['Cloudflare', 'GitHub / Git', 'Shopify', 'Cloudflare Pages', 'VS Code'],
  },
  {
    title: 'Specialities',
    icon: Crosshair,
    skills: ['SEO Optimization', 'Web Performance', 'AI Integration', 'Gemini API', 'Structured Data'],
  },
  {
    title: 'Fieldcraft',
    icon: Terminal,
    skills: ['Kali Linux', 'Networking', 'Computer Hardware', 'Tech Consulting', 'Freelancing'],
  },
]

const services = [
  {
    title: 'Static Website Dev',
    description: 'Purpose-built HTML, CSS, and JavaScript sites that arrive instantly and stay easy to maintain.',
    icon: Code2,
  },
  {
    title: 'Shopify Development',
    description: 'Focused storefront builds and refinements engineered around a clean buying journey.',
    icon: ShoppingBag,
  },
  {
    title: 'Performance Optimization',
    description: 'Cloudflare, caching, and Core Web Vitals tuned until every millisecond earns its place.',
    icon: Gauge,
  },
  {
    title: 'SEO Optimization',
    description: 'Technical SEO, structured data, and crawlable architecture that helps search engines understand.',
    icon: Search,
  },
  {
    title: 'Tech Consulting',
    description: 'Practical hardware and networking advice without the fog of unnecessary complexity.',
    icon: Network,
  },
  {
    title: 'AI Integration',
    description: 'Useful chatbots, workflow automation, and Gemini API integrations—not AI for its own sake.',
    icon: BrainCircuit,
  },
]

type SectionRevealProps = {
  children: ReactNode
  className?: string
  id?: string
  index: number
}

/** Reveals a semantic section and quietly tells the hydra where the visitor is. */
function SectionReveal({ children, className = '', id, index }: SectionRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const section = ref.current
    if (!section) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.dispatchEvent(new CustomEvent('hydra-section', { detail: { index } }))
        }
      },
      { rootMargin: '-32% 0px -46% 0px' },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [index])

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`section-shell ${className}`}
      initial={reduced ? false : { opacity: 0, y: 54, filter: 'blur(10px)' }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}

/** Custom eye cursor and a restrained organic ember trail for fine pointers. */
function PredatorCursor() {
  const eyeRef = useRef<HTMLDivElement>(null)
  const pupilRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reduced) return
    document.documentElement.classList.add('predator-cursor')
    let lastEmber = 0

    const onMove = (event: PointerEvent) => {
      eyeRef.current?.style.setProperty('transform', `translate3d(${event.clientX}px, ${event.clientY}px, 0)`)
      pupilRef.current?.style.setProperty('transform', `translate3d(${event.clientX}px, ${event.clientY}px, 0)`)
      const now = performance.now()
      if (now - lastEmber > 48) {
        lastEmber = now
        const ember = document.createElement('i')
        ember.className = 'cursor-ember'
        ember.style.left = `${event.clientX}px`
        ember.style.top = `${event.clientY}px`
        ember.style.setProperty('--drift', `${(Math.random() - 0.5) * 34}px`)
        document.body.appendChild(ember)
        window.setTimeout(() => ember.remove(), 800)
      }
    }
    const onDown = () => eyeRef.current?.classList.add('is-hunting')
    const onUp = () => eyeRef.current?.classList.remove('is-hunting')
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)

    return () => {
      document.documentElement.classList.remove('predator-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  return (
    <>
      <div ref={eyeRef} className="cursor-eye" aria-hidden="true" />
      <div ref={pupilRef} className="cursor-pupil" aria-hidden="true" />
    </>
  )
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <div className="section-heading">
      <p className="eyebrow"><span>{eyebrow}</span></p>
      <h2>{title}</h2>
      {copy && <p className="section-copy">{copy}</p>}
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [danger, setDanger] = useState(false)
  const reduced = useReducedMotion()

  const handleSceneReady = useCallback(() => setSceneReady(true), [])

  useEffect(() => {
    // Hold the ritual screen long enough for the eye-opening sequence to read.
    const delay = window.setTimeout(() => setLoaded(true), sceneReady ? 1450 : 4200)
    return () => window.clearTimeout(delay)
  }, [sceneReady])

  useEffect(() => {
    let timer = 0
    const onDanger = () => {
      setDanger(true)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setDanger(false), 470)
    }
    window.addEventListener('hydra-danger', onDanger)
    return () => {
      window.removeEventListener('hydra-danger', onDanger)
      window.clearTimeout(timer)
    }
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '')
    const email = String(data.get('email') ?? '')
    const project = String(data.get('project') ?? '')
    const subject = encodeURIComponent(`Project inquiry from ${name}`)
    const body = encodeURIComponent(`${project}\n\nReply to: ${email}`)
    window.location.href = `mailto:zayanzakir@icloud.com?subject=${subject}&body=${body}`
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className={`site-frame ${danger ? 'danger-near' : ''}`}>
      <a className="skip-link" href="#main">Skip to main content</a>
      <PredatorCursor />
      <div className="danger-flash" aria-hidden="true" />

      <div className={`awakening-screen ${loaded ? 'is-awake' : ''}`} aria-hidden={loaded}>
        <div className="awakening-mark">
          <span className="awakening-eye left" />
          <span className="awakening-eye right" />
        </div>
        <p className="loader-kicker">Deadhydra // 2211</p>
        <p className="loader-title">The beast awakens</p>
        <p className="loader-status">{sceneReady ? 'Eyes open. Enter carefully.' : 'Stirring beneath the surface…'}</p>
      </div>

      <Suspense fallback={null}>
        <HydraScene onReady={handleSceneReady} />
      </Suspense>

      <header className="topbar">
        <a className="brand" href="#home" onClick={closeMenu} aria-label="Deadhydra, back to home">
          <span className="brand-sigil" aria-hidden="true">DH</span>
          <span>DEADHYDRA<small>2211</small></span>
        </a>
        <nav className={menuOpen ? 'nav-open' : ''} aria-label="Primary navigation">
          <a href="#about" onClick={closeMenu}>Lore</a>
          <a href="#skills" onClick={closeMenu}>Arsenal</a>
          <a href="#projects" onClick={closeMenu}>Conquests</a>
          <a href="#services" onClick={closeMenu}>Services</a>
          <a href="#contact" onClick={closeMenu}>Summon</a>
        </nav>
        <a className="availability" href="#contact"><span /> Available for work</a>
        <button
          className="menu-button"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main id="main">
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero-vignette" aria-hidden="true" />
          <motion.div
            className="hero-content"
            initial={reduced ? false : { opacity: 0, x: -36 }}
            animate={loaded ? { opacity: 1, x: 0 } : { opacity: 0, x: -36 }}
            transition={{ duration: 0.9, delay: 0.16 }}
          >
            <p className="hero-kicker"><span /> Static Website Developer &amp; Tech Expert</p>
            <h1 id="hero-title"><span>MD. ZAYAN</span><strong>ZAKIR</strong></h1>
            <p className="hero-lede">
              I build lightning-fast, SEO-optimized static websites that load instantly and rank higher.
              Expert in Cloudflare, Shopify, AI integration, and modern web tech.
            </p>
            <div className="hero-actions">
              <a href="#projects" className="button button-primary">View my work <ArrowRight size={17} /></a>
              <a href="#contact" className="button button-ghost">Summon me</a>
            </div>
            <div className="hero-stats" aria-label="Career statistics">
              {[
                ['20+', 'Projects Built'],
                ['100%', 'Client Satisfaction'],
                ['24/7', 'Support'],
                ['3+', 'Years Experience'],
              ].map(([value, label]) => (
                <div key={label}><strong>{value}</strong><span>{label}</span></div>
              ))}
            </div>
          </motion.div>
          <div className="creature-label" aria-hidden="true">
            <span>SPECIMEN 2211</span>
            <i />
            <span>ACTIVE / PREDATORY</span>
          </div>
          <a className="scroll-cue" href="#about" aria-label="Scroll to about section">
            <span>Descend</span><ChevronDown size={17} />
          </a>
        </section>

        <SectionReveal id="about" className="about-section" index={1}>
          <div className="about-grid">
            <div>
              <SectionHeading eyebrow="01 // Origin" title="BUILT IN THE DARK. SHIPPED INTO LIGHT." />
              <div className="about-copy">
                <p className="lead">
                  A self-taught developer crafting clean, fast, SEO-optimized static sites—from utility tools
                  and NGO platforms to practical AI integrations.
                </p>
                <p>
                  I work close to the metal with pure HTML, CSS, and JavaScript, then deploy through Cloudflare
                  and GitHub. No unnecessary weight. No fragile theatre. Just purposeful work engineered to last.
                </p>
                <p>
                  Right now I’m exploring Gemini and Qwen APIs alongside Cloudflare infrastructure. The next
                  territory: deeper Node.js and MongoDB work, global freelance clients, and a larger Deadhydra brand.
                </p>
              </div>
              <blockquote>“Build Fast. Ship Clean. Make It Count.”</blockquote>
            </div>
            <aside className="lore-panel" aria-label="Personal details">
              <div className="panel-topline"><span>Field record</span><span>Identity verified</span></div>
              <dl>
                <div><dt>Location</dt><dd>Jhenaidah, Khulna Division, Bangladesh</dd></div>
                <div><dt>Languages</dt><dd>Bengali / English</dd></div>
                <div><dt>Discipline</dt><dd>Static Web / AI / Infrastructure</dd></div>
                <div><dt>Status</dt><dd className="toxic">Open to global work</dd></div>
              </dl>
              <div className="lore-rings" aria-hidden="true"><i /><i /><i /><b>2211</b></div>
            </aside>
          </div>
        </SectionReveal>

        <SectionReveal id="skills" className="skills-section" index={2}>
          <SectionHeading
            eyebrow="02 // Arsenal"
            title="TOOLS WITH TEETH."
            copy="A practical technical stack sharpened around speed, visibility, and reliable delivery."
          />
          <div className="skill-grid">
            {skillGroups.map(({ title, icon: Icon, skills }, groupIndex) => (
              <motion.article
                className="skill-card"
                key={title}
                initial={reduced ? false : { opacity: 0, y: 28 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: groupIndex * 0.08 }}
              >
                <div className="skill-card-heading"><Icon aria-hidden="true" /><span>0{groupIndex + 1}</span></div>
                <h3>{title}</h3>
                <ul>{skills.map((skill) => <li key={skill}><i />{skill}</li>)}</ul>
              </motion.article>
            ))}
          </div>
        </SectionReveal>

        <SectionReveal id="projects" className="projects-section" index={3}>
          <div className="heading-row">
            <SectionHeading
              eyebrow="03 // Selected conquests"
              title="PROOF, NOT PROMISES."
              copy="Live products, public tools, and useful digital territories—each built to survive the real web."
            />
            <a className="text-link" href="https://github.com/zayanzakir2211" target="_blank" rel="noreferrer">
              View GitHub <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="project-grid">
            {projects.map((project, projectIndex) => (
              <motion.a
                className="project-card"
                href={project.url}
                target="_blank"
                rel="noreferrer"
                key={project.title}
                aria-label={`${project.title}, opens external website`}
                initial={reduced ? false : { opacity: 0, y: 30 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: (projectIndex % 3) * 0.07 }}
              >
                <div className="project-top"><span>{project.number} / {project.year}</span><ArrowUpRight size={19} /></div>
                <div className="project-glyph" aria-hidden="true">
                  {projectIndex % 3 === 0 ? <BrainCircuit /> : projectIndex % 3 === 1 ? <Code2 /> : <CloudLightning />}
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="tag-row">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              </motion.a>
            ))}
          </div>
        </SectionReveal>

        <SectionReveal id="achievements" className="achievements-section" index={4}>
          <SectionHeading eyebrow="04 // Trophy chamber" title="CONQUESTS RECORDED IN STONE." />
          <div className="trophy-layout">
            <div className="trophy-list">
              {[
                ['2026.01.01', 'Launched 10+ Live Projects', 'A double-digit body of work released into the wild.'],
                ['2025.10.15', 'AI Integration Specialist', 'Practical AI systems joined the permanent arsenal.'],
                ['2025.06.01', 'First NGO Client — CHAYA', 'Technology placed in service of a real community mission.'],
              ].map(([date, title, description], index) => (
                <article className="trophy" key={title}>
                  <div className="trophy-icon"><Trophy aria-hidden="true" /><span>0{index + 1}</span></div>
                  <div><time>{date}</time><h3>{title}</h3><p>{description}</p></div>
                  <ShieldCheck className="trophy-seal" aria-hidden="true" />
                </article>
              ))}
            </div>
            <aside className="progress-panel">
              <p className="eyebrow"><span>Territory ahead</span></p>
              <h3>The hunt continues.</h3>
              <div className="progress-item">
                <div><span>First International Client</span><strong>35%</strong></div>
                <div className="progress-track"><i style={{ width: '35%' }} /></div>
              </div>
              <div className="progress-item">
                <div><span>100 GitHub Stars</span><strong>20%</strong></div>
                <div className="progress-track"><i style={{ width: '20%' }} /></div>
              </div>
              <p className="progress-note"><Sparkles size={15} /> In progress. Momentum is compounding.</p>
            </aside>
          </div>
        </SectionReveal>

        <SectionReveal id="services" className="services-section" index={5}>
          <SectionHeading
            eyebrow="05 // Services"
            title="SIX HEADS. ONE STANDARD."
            copy="Choose the problem. I bring the right discipline to the surface."
          />
          <div className="service-grid">
            {services.map(({ title, description, icon: Icon }, index) => (
              <article className="service-card" key={title}>
                <div className="service-number">0{index + 1}</div>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{description}</p>
                <a href="#contact" aria-label={`Ask about ${title}`}>Discuss this service <ArrowRight size={15} /></a>
              </article>
            ))}
          </div>
        </SectionReveal>

        <SectionReveal id="contact" className="contact-section" index={6}>
          <div className="contact-grid">
            <div className="contact-intro">
              <p className="eyebrow"><span>06 // Open channel</span></p>
              <h2>HAVE A PROJECT?<br /><em>SUMMON ME.</em></h2>
              <p>
                Bring the idea, the bottleneck, or the half-built thing. I’ll reply with a clear next move—usually
                within 24 hours.
              </p>
              <div className="contact-links">
                <a href="mailto:zayanzakir@icloud.com"><Mail aria-hidden="true" /><span><small>Email</small>zayanzakir@icloud.com</span></a>
                <a href="tel:+8801866205076"><Phone aria-hidden="true" /><span><small>Phone</small>+880 1866 205076</span></a>
                <div><MapPin aria-hidden="true" /><span><small>Location</small>Jhenaidah, Bangladesh</span></div>
                <div><Clock3 aria-hidden="true" /><span><small>Response</small>Within 24 hours</span></div>
              </div>
              <div className="social-row" aria-label="Social profiles">
                <a href="https://github.com/zayanzakir2211" target="_blank" rel="noreferrer" aria-label="GitHub"><Github /></a>
                <a href="https://www.instagram.com/md.zayanzakir" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram /></a>
                <a href="https://www.facebook.com/md.zayanzakir" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook /></a>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-status"><span><i /> Secure channel open</span><span>Typically replies &lt; 24h</span></div>
              <label>
                <span>Your name</span>
                <input type="text" name="name" placeholder="What should I call you?" autoComplete="name" required />
              </label>
              <label>
                <span>Email address</span>
                <input type="email" name="email" placeholder="you@company.com" autoComplete="email" required />
              </label>
              <label>
                <span>Tell me about the project</span>
                <textarea name="project" rows={5} placeholder="Scope, timeline, existing site—anything useful…" required />
              </label>
              <button className="button button-primary submit-button" type="submit">
                Open email draft <Send size={17} />
              </button>
              <p className="form-note"><Check size={13} /> This form opens your email client. Your details are never stored here.</p>
            </form>
          </div>
        </SectionReveal>
      </main>

      <footer>
        <a className="brand footer-brand" href="#home"><span className="brand-sigil">DH</span><span>DEADHYDRA<small>2211</small></span></a>
        <p>Fast sites. Clean code. No dead weight.</p>
        <p>© {new Date().getFullYear()} MD. Zayan Zakir.</p>
      </footer>
    </div>
  )
}

export default App
