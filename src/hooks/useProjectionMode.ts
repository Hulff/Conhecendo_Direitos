import { useEffect, useState } from 'react'

const STORAGE_KEY = 'conhecendo-direitos:modo-projecao'

function readPreference(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function useProjectionMode() {
  const [enabled, setEnabled] = useState(readPreference)

  useEffect(() => {
    document.documentElement.classList.toggle('projection-mode', enabled)
    try {
      window.localStorage.setItem(STORAGE_KEY, String(enabled))
    } catch {
      // O modo continua ativo nesta tela mesmo se o navegador bloquear o armazenamento.
    }
  }, [enabled])

  return { enabled, toggle: () => setEnabled((current) => !current) }
}
