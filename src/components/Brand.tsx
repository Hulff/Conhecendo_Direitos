interface BrandProps {
  compact?: boolean
}

export default function Brand({ compact = false }: BrandProps) {
  return (
    <h1 className={`brand-title${compact ? ' brand-title-compact' : ''}`}>
      <span className="gold">Conhecendo</span>
      <span className="white">Direitos</span>
    </h1>
  )
}
