// Kong Gateway: ws://localhost:8000/ws/{user_id}
let ws = null
let pingInterval = null
let reconnectTimer = null
let retryDelay = 5000
const MAX_RETRY_DELAY = 60000

export function connectWebSocket(userId, onMessage) {
  if (ws?.readyState === WebSocket.OPEN) return () => {}

  function connect() {
    ws = new WebSocket(`ws://localhost:8000/ws/${userId}`)

    ws.onmessage = (event) => {
      if (event.data === 'pong') return
      try {
        const notification = JSON.parse(event.data)
        onMessage(notification)
      } catch (e) {
        console.error('WS parse error', e)
      }
    }

    ws.onerror = () => {}

    ws.onclose = () => {
      clearInterval(pingInterval)
      pingInterval = null
      // Exponential backoff: 5s → 10s → 20s → … → 60s max
      reconnectTimer = globalThis.setTimeout(connect, retryDelay)
      retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY)
    }

    ws.onopen = () => {
      retryDelay = 5000 // reset on successful connection
      pingInterval = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) ws.send('ping')
      }, 30000)
    }
  }

  connect()

  return () => {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
    clearInterval(pingInterval)
    pingInterval = null
    ws?.close()
    ws = null
  }
}

export function disconnectWebSocket() {
  clearTimeout(reconnectTimer)
  reconnectTimer = null
  clearInterval(pingInterval)
  pingInterval = null
  ws?.close()
  ws = null
  retryDelay = 5000
}
