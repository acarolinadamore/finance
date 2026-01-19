import { X } from "lucide-react"

interface LifeArea {
  id: number
  name: string
  color: string
}

interface AreaCount {
  [key: number]: number
}

interface TagsFilterProps {
  lifeAreas: LifeArea[]
  selectedAreaId: number | null
  onAreaChange: (areaId: number | null) => void
  totalCount: number
  areaCounts: AreaCount
}

export function TagsFilter({ lifeAreas, selectedAreaId, onAreaChange, totalCount, areaCounts }: TagsFilterProps) {
  if (lifeAreas.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Filtrar por área:</span>

        {/* Opção "Todos" */}
        <button
          onClick={() => onAreaChange(null)}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedAreaId === null
              ? "bg-gray-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm"
          }`}
        >
          <span>Todos</span>
          <span className={`inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full text-xs font-bold ${
            selectedAreaId === null
              ? "bg-white/20 text-white"
              : "bg-gray-300 text-gray-700"
          }`}>
            {totalCount}
          </span>
        </button>

        {lifeAreas.map((area) => {
          const isSelected = selectedAreaId === area.id
          const count = areaCounts[area.id] || 0

          return (
            <button
              key={area.id}
              onClick={() => onAreaChange(isSelected ? null : area.id)}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? "ring-2 ring-offset-1 shadow-md"
                  : "shadow-sm hover:shadow-md"
              }`}
              style={{
                backgroundColor: isSelected ? area.color : `${area.color}15`,
                color: isSelected ? "#fff" : area.color,
                ringColor: area.color,
              }}
            >
              <span>{area.name}</span>
              <span
                className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : `${area.color}30`,
                  color: isSelected ? "#fff" : area.color,
                }}
              >
                {count}
              </span>
              {isSelected && <X className="h-3 w-3" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
