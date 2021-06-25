import React, { FC, useCallback, useMemo } from 'react'

interface AnyObject {
  [key: string]: any
}

export interface UserData {
  user_identity: number[]
  user_contact: string
  user_token: string
  try: number
  status: number
  user: AnyObject
}

export interface State {
  counter: number
  user: UserData | null
}

const initialState = {
  counter: 0,
  user: null,
}

type Action =
  | {
      type: 'SET_USER_DATA'
      value: UserData
    }
  | {
      type: 'SET_COUNTER'
      value: number
    }

export const UIContext = React.createContext<State | any>(initialState)

UIContext.displayName = 'UIContext'

function uiReducer(state: State, action: Action) {
  switch (action.type) {
    case 'SET_USER_DATA': {
      return {
        ...state,
        user: action.value,
      }
    }
    case 'SET_COUNTER': {
      return {
        ...state,
        counter: action.value,
      }
    }
  }
}

export const UIProvider: FC = (props) => {
  const [state, dispatch] = React.useReducer(uiReducer, initialState)

  const setUserData = useCallback(
    (value: UserData) => dispatch({ type: 'SET_USER_DATA', value }),
    [dispatch]
  )

  const value = useMemo(
    () => ({
      ...state,
      setUserData,
    }),
    [state]
  )

  return <UIContext.Provider value={value} {...props} />
}

export const useUI = () => {
  const context = React.useContext(UIContext)
  if (context === undefined) {
    throw new Error(`useUI must be used within a UIProvider`)
  }
  return context
}

export const ManagedUIContext: FC = ({ children }) => (
  <UIProvider>{children}</UIProvider>
)
