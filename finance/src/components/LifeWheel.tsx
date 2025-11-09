interface LifeArea {
  id: number
  name: string
  description: string
  color: string
  satisfaction_level: number
  display_order: number
  created_at: string
  updated_at: string
}

interface LifeWheelProps {
  lifeAreas: LifeArea[]
  onAreaClick: (area: LifeArea) => void
}

export const LifeWheel = ({ lifeAreas, onAreaClick }: LifeWheelProps) => {
  // Ordenar áreas pela ordem de exibição para seguir sentido horário
  const sortedAreas = [...lifeAreas].sort(
    (a, b) => a.display_order - b.display_order
  )

  const centerX = 400
  const centerY = 400
  const maxRadius = 280
  const labelRadius = 310

  // Criar path para cada setor (triângulo/cone)
  const createSectorPath = (index: number, value: number) => {
    const angleStep = (2 * Math.PI) / 12 // 30° em radianos
    const startAngle = -Math.PI / 2 + index * angleStep // Começa do topo
    const endAngle = startAngle + angleStep
    const radius = (value / 10) * maxRadius

    // Ponto inicial (centro)
    const x1 = centerX + radius * Math.cos(startAngle)
    const y1 = centerY + radius * Math.sin(startAngle)

    // Arco
    const x2 = centerX + radius * Math.cos(endAngle)
    const y2 = centerY + radius * Math.sin(endAngle)

    // Criar o path completo
    const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`

    return path
  }

  // Calcular posição e rotação do label
  const getLabelPosition = (index: number) => {
    const angleStep = (2 * Math.PI) / 12
    const angle = -Math.PI / 2 + index * angleStep + angleStep / 2 // Centro do setor

    const x = centerX + labelRadius * Math.cos(angle)
    const y = centerY + labelRadius * Math.sin(angle)

    // Calcular rotação em graus (perpendicular ao raio)
    const angleDegrees = (angle * 180) / Math.PI
    let rotation = angleDegrees + 90 // Perpendicular ao raio

    // Normalizar rotação para o intervalo 0-360
    rotation = ((rotation % 360) + 360) % 360

    // Inverter especificamente as áreas do lado esquerdo/inferior
    // Índices 3-8: Família, Amor & Romance, Vida Social, Crescimento Pessoal, Recreação, Ambiente Físico
    const indicesToInvert = [3, 4, 5, 6, 7, 8]

    if (indicesToInvert.includes(index)) {
      rotation = rotation - 180
    }

    return { x, y, rotation }
  }

  // Calcular posição do ponto (dot)
  const getDotPosition = (index: number, value: number) => {
    const angleStep = (2 * Math.PI) / 12
    const angle = -Math.PI / 2 + index * angleStep + angleStep / 2
    const radius = (value / 10) * maxRadius

    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)

    return { x, y }
  }

  return (
    <div className="w-full">
      <svg width="100%" height="800" viewBox="0 0 800 800">
        {/* Grid circular de fundo */}
        {[2, 4, 6, 8, 10].map((level) => (
          <circle
            key={level}
            cx={centerX}
            cy={centerY}
            r={(level / 10) * maxRadius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}

        {/* Linhas radiais */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angleStep = (2 * Math.PI) / 12
          const angle = -Math.PI / 2 + i * angleStep
          const x = centerX + maxRadius * Math.cos(angle)
          const y = centerY + maxRadius * Math.sin(angle)

          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          )
        })}

        {/* Setores coloridos (triângulos/cones) */}
        {sortedAreas.map((area, index) => (
          <path
            key={area.id}
            d={createSectorPath(index, area.satisfaction_level)}
            fill={area.color}
            fillOpacity={0.6}
            stroke={area.color}
            strokeWidth={0.5}
            style={{ cursor: "pointer" }}
            onClick={() => onAreaClick(area)}
            onMouseEnter={(e) => {
              e.currentTarget.setAttribute("fill-opacity", "0.8")
            }}
            onMouseLeave={(e) => {
              e.currentTarget.setAttribute("fill-opacity", "0.6")
            }}
          />
        ))}

        {/* Pontos (dots) - removidos para visual mais limpo */}

        {/* Labels (nomes das áreas) */}
        {sortedAreas.map((area, index) => {
          const { x, y, rotation } = getLabelPosition(index)

          return (
            <text
              key={`label-${area.id}`}
              x={x}
              y={y}
              fill={area.color}
              fontSize={14}
              fontWeight="600"
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${rotation}, ${x}, ${y})`}
              style={{ cursor: "pointer" }}
              onClick={() => onAreaClick(area)}
            >
              {area.name}
            </text>
          )
        })}

        {/* Números do eixo radial */}
        {[2, 4, 6, 8, 10].map((level) => (
          <text
            key={`tick-${level}`}
            x={centerX + 5}
            y={centerY - (level / 10) * maxRadius}
            fill="#4b5563"
            fontSize={12}
            fontWeight="600"
            textAnchor="start"
          >
            {level}
          </text>
        ))}
      </svg>
    </div>
  )
}
