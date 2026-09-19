import type { AskMessage } from './types'

const KEY = 'vn-ask-chat-v1'
const PATH_KEY = 'vn-ask-last-path'

export function loadAskMessages(): AskMessage[] {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AskMessage[]
    return Array.isArray(parsed) ? parsed.slice(-40) : []
  } catch {
    return []
  }
}

export function saveAskMessages(messages: AskMessage[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(messages.slice(-40)))
  } catch {
    /* ignore */
  }
}

export function rememberAskPath(pathname: string) {
  if (!pathname || pathname === '/ask') return
  try {
    sessionStorage.setItem(PATH_KEY, pathname)
  } catch {
    /* ignore */
  }
}

export function lastAskPath() {
  try {
    return sessionStorage.getItem(PATH_KEY) || '/plan/builder/experiences'
  } catch {
    return '/plan/builder/experiences'
  }
}
