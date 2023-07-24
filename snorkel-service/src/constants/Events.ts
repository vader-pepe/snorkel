type EventsKeys = keyof typeof Events;
export type EventValues = typeof Events[EventsKeys];

export const Events = {
  READY: 'ready',
  MEDIA_UPLOADED: 'media_uploaded',
  DISCONNECTED: 'disconnected',
  STATE_CHANGED: 'change_state',
} as const

type StateKeys = keyof typeof State;
export type StateValues = typeof State[StateKeys];

export const State = {
  LOGGED_IN: 'logged-in',
  NEED_LOG_IN: 'need-log-in',
  LOADING: 'loading',
  LOADING_DONE: 'loading-done',
} as const

