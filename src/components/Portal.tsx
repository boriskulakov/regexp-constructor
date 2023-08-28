import { createPortal } from 'react-dom'

interface PortalProps {
  children?: React.ReactNode
}

function Portal({ children }: PortalProps) {
  const portalRoot = document.getElementById('portal') as HTMLElement
  return createPortal(children, portalRoot)
}
export default Portal
