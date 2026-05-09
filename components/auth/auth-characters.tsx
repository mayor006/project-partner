'use client'

import { useState, useEffect, useRef } from 'react'

interface PupilProps {
  size?: number
  maxDistance?: number
  pupilColor?: string
  forceLookX?: number
  forceLookY?: number
}

const Pupil = ({
  size = 12, maxDistance = 5, pupilColor = '#000',
  forceLookX, forceLookY,
}: PupilProps) => {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY) }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const calc = () => {
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY }
    if (!ref.current) return { x: 0, y: 0 }
    const r = ref.current.getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const dx = mouseX - cx, dy = mouseY - cy
    const d = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance)
    const a = Math.atan2(dy, dx)
    return { x: Math.cos(a) * d, y: Math.sin(a) * d }
  }

  const p = calc()
  return (
    <div
      ref={ref}
      className="rounded-full"
      style={{
        width: size, height: size, backgroundColor: pupilColor,
        transform: `translate(${p.x}px, ${p.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  )
}

interface EyeBallProps {
  size?: number
  pupilSize?: number
  maxDistance?: number
  eyeColor?: string
  pupilColor?: string
  isBlinking?: boolean
  forceLookX?: number
  forceLookY?: number
}

const EyeBall = ({
  size = 18, pupilSize = 7, maxDistance = 5,
  eyeColor = '#fff', pupilColor = '#2D2D2D',
  isBlinking, forceLookX, forceLookY,
}: EyeBallProps) => {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY) }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const calc = () => {
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY }
    if (!ref.current) return { x: 0, y: 0 }
    const r = ref.current.getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const dx = mouseX - cx, dy = mouseY - cy
    const d = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance)
    const a = Math.atan2(dy, dx)
    return { x: Math.cos(a) * d, y: Math.sin(a) * d }
  }

  const p = calc()
  return (
    <div
      ref={ref}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: size, height: isBlinking ? 2 : size,
        backgroundColor: eyeColor, overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: pupilSize, height: pupilSize, backgroundColor: pupilColor,
            transform: `translate(${p.x}px, ${p.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   The 4-character scene used on the auth left panel
───────────────────────────────────────── */
export interface AuthCharactersProps {
  /** Are we typing in the email or password field? Triggers leaning. */
  isTyping?: boolean
  /** Current password value — drives "covering eyes" / peeking behavior. */
  password?: string
  /** Whether the password is currently shown in plain text. */
  showPassword?: boolean
}

export function AuthCharacters({
  isTyping = false,
  password = '',
  showPassword = false,
}: AuthCharactersProps) {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const [purpleBlink, setPurpleBlink] = useState(false)
  const [blackBlink, setBlackBlink] = useState(false)
  const [lookAtEachOther, setLookAtEachOther] = useState(false)
  const [purplePeeking, setPurplePeeking] = useState(false)

  const purpleRef = useRef<HTMLDivElement>(null)
  const blackRef = useRef<HTMLDivElement>(null)
  const yellowRef = useRef<HTMLDivElement>(null)
  const orangeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY) }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // Random blinking
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const sched = () => {
      t = setTimeout(() => {
        setPurpleBlink(true)
        setTimeout(() => { setPurpleBlink(false); sched() }, 150)
      }, Math.random() * 4000 + 3000)
    }
    sched()
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const sched = () => {
      t = setTimeout(() => {
        setBlackBlink(true)
        setTimeout(() => { setBlackBlink(false); sched() }, 150)
      }, Math.random() * 4000 + 3000)
    }
    sched()
    return () => clearTimeout(t)
  }, [])

  // When typing starts, briefly look at each other
  useEffect(() => {
    if (isTyping) {
      setLookAtEachOther(true)
      const t = setTimeout(() => setLookAtEachOther(false), 800)
      return () => clearTimeout(t)
    }
    setLookAtEachOther(false)
  }, [isTyping])

  // Purple sneakily peeks if password is visible
  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const t = setTimeout(() => {
        setPurplePeeking(true)
        setTimeout(() => setPurplePeeking(false), 800)
      }, Math.random() * 3000 + 2000)
      return () => clearTimeout(t)
    }
    setPurplePeeking(false)
  }, [password, showPassword, purplePeeking])

  const calcPos = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 }
    const r = ref.current.getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = r.top + r.height / 3
    const dx = mouseX - cx, dy = mouseY - cy
    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    }
  }

  const p = calcPos(purpleRef)
  const b = calcPos(blackRef)
  const y = calcPos(yellowRef)
  const o = calcPos(orangeRef)

  const passwordCovered = password.length > 0 && !showPassword
  const passwordVisible = password.length > 0 && showPassword

  return (
    <div className="relative" style={{ width: 550, height: 400, maxWidth: '100%' }}>
      {/* Purple — back */}
      <div
        ref={purpleRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 70, width: 180,
          height: (isTyping || passwordCovered) ? 440 : 400,
          backgroundColor: '#6C3FF5',
          borderRadius: '10px 10px 0 0',
          zIndex: 1,
          transform: passwordVisible
            ? 'skewX(0deg)'
            : (isTyping || passwordCovered)
              ? `skewX(${(p.bodySkew || 0) - 12}deg) translateX(40px)`
              : `skewX(${p.bodySkew || 0}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <div
          className="absolute flex gap-8 transition-all duration-700 ease-in-out"
          style={{
            left: passwordVisible ? 20 : lookAtEachOther ? 55 : 45 + p.faceX,
            top:  passwordVisible ? 35 : lookAtEachOther ? 65 : 40 + p.faceY,
          }}
        >
          <EyeBall
            size={18} pupilSize={7} maxDistance={5}
            isBlinking={purpleBlink}
            forceLookX={passwordVisible ? (purplePeeking ? 4 : -4) : lookAtEachOther ? 3 : undefined}
            forceLookY={passwordVisible ? (purplePeeking ? 5 : -4) : lookAtEachOther ? 4 : undefined}
          />
          <EyeBall
            size={18} pupilSize={7} maxDistance={5}
            isBlinking={purpleBlink}
            forceLookX={passwordVisible ? (purplePeeking ? 4 : -4) : lookAtEachOther ? 3 : undefined}
            forceLookY={passwordVisible ? (purplePeeking ? 5 : -4) : lookAtEachOther ? 4 : undefined}
          />
        </div>
      </div>

      {/* Black — middle */}
      <div
        ref={blackRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 240, width: 120, height: 310,
          backgroundColor: '#1a1a22',
          borderRadius: '8px 8px 0 0',
          zIndex: 2,
          border: '1px solid rgba(255,255,255,0.06)',
          transform: passwordVisible
            ? 'skewX(0deg)'
            : lookAtEachOther
              ? `skewX(${(b.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
              : (isTyping || passwordCovered)
                ? `skewX(${(b.bodySkew || 0) * 1.5}deg)`
                : `skewX(${b.bodySkew || 0}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <div
          className="absolute flex gap-6 transition-all duration-700 ease-in-out"
          style={{
            left: passwordVisible ? 10 : lookAtEachOther ? 32 : 26 + b.faceX,
            top:  passwordVisible ? 28 : lookAtEachOther ? 12 : 32 + b.faceY,
          }}
        >
          <EyeBall
            size={16} pupilSize={6} maxDistance={4}
            isBlinking={blackBlink}
            forceLookX={passwordVisible ? -4 : lookAtEachOther ? 0 : undefined}
            forceLookY={passwordVisible ? -4 : lookAtEachOther ? -4 : undefined}
          />
          <EyeBall
            size={16} pupilSize={6} maxDistance={4}
            isBlinking={blackBlink}
            forceLookX={passwordVisible ? -4 : lookAtEachOther ? 0 : undefined}
            forceLookY={passwordVisible ? -4 : lookAtEachOther ? -4 : undefined}
          />
        </div>
      </div>

      {/* Orange semicircle — front left */}
      <div
        ref={orangeRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 0, width: 240, height: 200,
          zIndex: 3,
          backgroundColor: '#FF9B6B',
          borderRadius: '120px 120px 0 0',
          transform: passwordVisible ? 'skewX(0deg)' : `skewX(${o.bodySkew || 0}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <div
          className="absolute flex gap-8 transition-all duration-200 ease-out"
          style={{
            left: passwordVisible ? 50 : 82 + (o.faceX || 0),
            top:  passwordVisible ? 85 : 90 + (o.faceY || 0),
          }}
        >
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D"
            forceLookX={passwordVisible ? -5 : undefined}
            forceLookY={passwordVisible ? -4 : undefined} />
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D"
            forceLookX={passwordVisible ? -5 : undefined}
            forceLookY={passwordVisible ? -4 : undefined} />
        </div>
      </div>

      {/* Yellow rounded rectangle — front right */}
      <div
        ref={yellowRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 310, width: 140, height: 230,
          backgroundColor: '#E8D754',
          borderRadius: '70px 70px 0 0',
          zIndex: 4,
          transform: passwordVisible ? 'skewX(0deg)' : `skewX(${y.bodySkew || 0}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <div
          className="absolute flex gap-6 transition-all duration-200 ease-out"
          style={{
            left: passwordVisible ? 20 : 52 + (y.faceX || 0),
            top:  passwordVisible ? 35 : 40 + (y.faceY || 0),
          }}
        >
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D"
            forceLookX={passwordVisible ? -5 : undefined}
            forceLookY={passwordVisible ? -4 : undefined} />
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D"
            forceLookX={passwordVisible ? -5 : undefined}
            forceLookY={passwordVisible ? -4 : undefined} />
        </div>
        <div
          className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
          style={{
            left: passwordVisible ? 10 : 40 + (y.faceX || 0),
            top:  passwordVisible ? 88 : 88 + (y.faceY || 0),
          }}
        />
      </div>
    </div>
  )
}
