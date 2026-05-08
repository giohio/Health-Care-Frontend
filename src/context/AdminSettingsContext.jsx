/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react'
import PropTypes from 'prop-types'

const AdminSettingsContext = createContext(null)

const DEFAULT_SETTINGS = {
  themeMode: 'dark',
  setThemeMode: () => {},
  accentColor: 'rose',
  setAccentColor: () => {},
  sidebarSize: 'expanded',
  setSidebarSize: () => {},
}

export function AdminSettingsProvider({ value, children }) {
  return (
    <AdminSettingsContext.Provider value={value}>
      {children}
    </AdminSettingsContext.Provider>
  )
}

AdminSettingsProvider.propTypes = {
  value: PropTypes.shape({
    themeMode: PropTypes.oneOf(['light', 'dark', 'system']).isRequired,
    setThemeMode: PropTypes.func.isRequired,
    accentColor: PropTypes.oneOf(['rose', 'indigo', 'teal', 'violet', 'amber']).isRequired,
    setAccentColor: PropTypes.func.isRequired,
    sidebarSize: PropTypes.oneOf(['expanded', 'collapsed']).isRequired,
    setSidebarSize: PropTypes.func.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
}

export function useAdminSettings() {
  const context = useContext(AdminSettingsContext)
  return context || DEFAULT_SETTINGS
}
