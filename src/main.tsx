import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@mantine/core/styles.css'
import { createTheme, MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'

import { AuthProvider } from './context/AuthContext'
import './styles.css'
import App from './App.tsx'

const theme = createTheme({
  primaryColor: 'indigo',
  breakpoints: {
    xs: '24em',
    sm: '30em',
    md: '48em',
    lg: '64em',
    xl: '74em',
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>,
)
