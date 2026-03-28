import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Returns { pos, dragHandleProps } where:
 *  - pos: { x, y } in px from the top-left of the viewport (null = use default CSS position)
 *  - dragHandleProps: spread onto the element that should initiate the drag
 *
 * @param {{ x: number, y: number }} initialPos   Pixel offset from top-left to start at.
 *                                                 Pass null to keep the element at its default
 *                                                 CSS-positioned location until the user drags.
 */
function useDraggable(initialPos = null) {
  const [pos, setPos] = useState(initialPos)
  const dragging = useRef(false)
  const startMouse = useRef({ x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })
  const nodeRef = useRef(null)

  const onMouseDown = useCallback((e) => {
    // Only drag on left button; ignore clicks inside interactive children
    if (e.button !== 0) return
    const tag = e.target.tagName
    if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT') return

    e.preventDefault()
    dragging.current = true
    startMouse.current = { x: e.clientX, y: e.clientY }

    // Resolve starting position from the DOM rect when pos is still null
    const rect = nodeRef.current?.getBoundingClientRect()
    startPos.current = pos ?? (rect ? { x: rect.left, y: rect.top } : { x: 0, y: 0 })
  }, [pos])

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return
      const dx = e.clientX - startMouse.current.x
      const dy = e.clientY - startMouse.current.y
      setPos({ x: startPos.current.x + dx, y: startPos.current.y + dy })
    }
    const onUp = () => { dragging.current = false }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const dragHandleProps = {
    ref: nodeRef,
    onMouseDown,
    style: { cursor: 'grab' },
  }

  return { pos, dragHandleProps }
}

export default useDraggable
