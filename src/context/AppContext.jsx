import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react'
import { api } from '../api/index.js'

const AppContext = createContext(null)

const emptyState = {
  sims: [],
  agents: [],
  transactions: [],
  staff: [],
  settings: { defaultDebtAlertDays: 7, defaultDebtAlertAmount: 5000 },
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload }
    case 'SET_SIMS':
      return { ...state, sims: action.payload }
    case 'SET_AGENTS':
      return { ...state, agents: action.payload }
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload }
    case 'SET_STAFF':
      return { ...state, staff: action.payload }

    case 'ADD_SIM':
      return { ...state, sims: [action.payload, ...state.sims] }
    case 'UPDATE_SIM':
      return { ...state, sims: state.sims.map(s => s.id === action.payload.id ? action.payload : s) }
    case 'DELETE_SIM':
      return { ...state, sims: state.sims.filter(s => s.id !== action.payload) }

    case 'ADD_AGENT':
      return { ...state, agents: [action.payload, ...state.agents] }
    case 'UPDATE_AGENT':
      return { ...state, agents: state.agents.map(a => a.id === action.payload.id ? action.payload : a) }
    case 'DELETE_AGENT':
      return { ...state, agents: state.agents.filter(a => a.id !== action.payload) }

    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] }
    case 'UPDATE_TRANSACTION':
      return { ...state, transactions: state.transactions.map(t => t.id === action.payload.id ? action.payload : t) }
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) }

    case 'ADD_STAFF':
      return { ...state, staff: [...(state.staff || []), action.payload] }
    case 'UPDATE_STAFF':
      return { ...state, staff: (state.staff || []).map(s => s.id === action.payload.id ? action.payload : s) }
    case 'DELETE_STAFF':
      return { ...state, staff: (state.staff || []).filter(s => s.id !== action.payload) }

    case 'CLEAR_ALL_DATA':
      return { ...state, sims: [], agents: [], transactions: [] }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, reducerDispatch] = useReducer(reducer, emptyState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadAll() {
    const token = localStorage.getItem('simagent_token')
    if (!token) { setLoading(false); return }
    try {
      setLoading(true)
      const [sims, agents, transactions, staff] = await Promise.all([
        api.sims.list(),
        api.agents.list(),
        api.transactions.list(),
        api.staff.list(),
      ])
      reducerDispatch({ type: 'LOAD_STATE', payload: { sims, agents, transactions, staff } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const reload = useCallback(() => loadAll(), [])

  const dispatch = useCallback(async (action) => {
    try {
      switch (action.type) {
        case 'ADD_SIM': {
          const result = await api.sims.create(action.payload)
          reducerDispatch({ type: 'ADD_SIM', payload: result })
          break
        }
        case 'UPDATE_SIM': {
          const result = await api.sims.update(action.payload.id, action.payload)
          reducerDispatch({ type: 'UPDATE_SIM', payload: result })
          break
        }
        case 'DELETE_SIM': {
          await api.sims.remove(action.payload)
          reducerDispatch({ type: 'DELETE_SIM', payload: action.payload })
          break
        }
        case 'ADD_AGENT': {
          const result = await api.agents.create(action.payload)
          reducerDispatch({ type: 'ADD_AGENT', payload: result })
          break
        }
        case 'UPDATE_AGENT': {
          const result = await api.agents.update(action.payload.id, action.payload)
          reducerDispatch({ type: 'UPDATE_AGENT', payload: result })
          break
        }
        case 'DELETE_AGENT': {
          await api.agents.remove(action.payload)
          reducerDispatch({ type: 'DELETE_AGENT', payload: action.payload })
          break
        }
        case 'ADD_TRANSACTION': {
          const result = await api.transactions.create(action.payload)
          reducerDispatch({ type: 'ADD_TRANSACTION', payload: result })
          break
        }
        case 'UPDATE_TRANSACTION': {
          const result = await api.transactions.update(action.payload.id, action.payload)
          reducerDispatch({ type: 'UPDATE_TRANSACTION', payload: result })
          break
        }
        case 'DELETE_TRANSACTION': {
          await api.transactions.remove(action.payload)
          reducerDispatch({ type: 'DELETE_TRANSACTION', payload: action.payload })
          break
        }
        case 'ADD_STAFF': {
          const result = await api.staff.create(action.payload)
          reducerDispatch({ type: 'ADD_STAFF', payload: result })
          break
        }
        case 'UPDATE_STAFF': {
          const result = await api.staff.update(action.payload.id, action.payload)
          reducerDispatch({ type: 'UPDATE_STAFF', payload: result })
          break
        }
        case 'DELETE_STAFF': {
          await api.staff.remove(action.payload)
          reducerDispatch({ type: 'DELETE_STAFF', payload: action.payload })
          break
        }
        case 'CLEAR_ALL_DATA': {
          await api.clearAll()
          reducerDispatch({ type: 'CLEAR_ALL_DATA' })
          break
        }
        default:
          reducerDispatch(action)
      }
    } catch (err) {
      console.error('Dispatch error:', err.message)
      alert(`เกิดข้อผิดพลาด: ${err.message}`)
    }
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch, reload, loading, error }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
