import { fetch } from '../util/api'
import { receivedNotification } from './notification'

export const TOGGLE_DECK = 'TOGGLE_DECK'

export const RUN_DECK_SUCCEEDED = 'RUN_DECK_SUCCEEDED'
export const RUN_DECK_FAILED = 'RUN_DECK_FAILED'

export const CANCEL_DECK_SUCCEEDED = 'CANCEL_DECK_SUCCEEDED'
export const CANCEL_DECK_FAILED = 'CANCEL_DECK_FAILED'

export const LOADING_DECKS = 'LOADING_DECKS'
export const LOADING_DECKS_SUCCEEDED = 'LOADING_DECKS_SUCCEEDED'
export const LOADING_DECKS_FAILED = 'LOADING_DECKS_FAILED'

export const runDeckSucceeded = (decks) => ({
  type: RUN_DECK_SUCCEEDED,
  decks
})

export const runDeckFailed = (deckId, ex) => ({
  type: RUN_DECK_FAILED,
  deckId,
  ex
})

export const runDeck = (deckId) => (dispatch, getState) => {
  return fetch(`/api/deck/${deckId}/run`, { method: 'POST' })
    .then(data => data.json())
    .then((json) => {
      // XXX maybe check the return value?
      let decks = getState().deck.decks.map((deck) => {
        if (deck.id === deckId) {
          return { ...deck, running: true }
        }
        return { ...deck }
      })
      return decks
    })
    .then(decks => dispatch(runDeckSucceeded(decks)))
    .catch((ex) => {
      dispatch(receivedNotification('Error', `Could not run deck ${deckId}`, 'error'))
      dispatch(runDeckFailed(deckId, ex))
    })
}

export const toggleDeck = (deckId) => (dispatch, getState) => {
  let action = null
  let decks = getState().deck.decks.map((deck) => {
    if (deck.id === deckId) {
      action = deck.enabled ? 'disable' : 'enable'
      return { ...deck, enabled: !deck.enabled }
    }
    return { ...deck }
  })
  if (action === null) {
    // XXX handle this case
    return
  }
  return fetch(`/api/deck/${deckId}/${action}`, { method: 'POST' })
    .then(data => data.json())
    .then(json => {
      dispatch(loadingDecksSucceeded(decks))
    })
    .catch((ex) => {
      dispatch(receivedNotification('Failed to load decks', ex.toString(), 'error'))
    })
}

export const loadingDecks = () => ({
  type: LOADING_DECKS
})

export const loadingDecksSucceeded = (decks) => ({
  type: LOADING_DECKS_SUCCEEDED,
  decks
})
export const loadingDecksFailed = (ex) => ({
  type: LOADING_DECKS_FAILED,
  ex
})

export const load = () => (dispatch, getState) => {
  dispatch(loadingDecks())

  fetch('/api/deck')
    .then(data => data.json())
    // XXX take out of here infoBoxOpen
    .then(json => json.decks.map((deck) => ({ ...deck, infoBoxOpen: false })))
    .then(decks => dispatch(loadingDecksSucceeded(decks)))
    .catch((ex) => {
      dispatch(receivedNotification('Failed to load decks', ex.toString(), 'error'))
      dispatch(loadingDecksFailed(ex))
    })
}
