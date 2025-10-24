import { getLabelsByIds } from '../config/labels'

const DietaryLabels = ({ labels = [], size = 'small', showIcon = true }) => {
  if (!labels || labels.length === 0) {
    return null
  }

  const labelData = getLabelsByIds(labels)

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-xs px-2 py-1'
      case 'medium':
        return 'text-sm px-3 py-1.5'
      case 'large':
        return 'text-base px-4 py-2'
      default:
        return 'text-xs px-2 py-1'
    }
  }

  return (
    <div className="flex flex-wrap gap-1">
      {labelData.map((label) => (
        <span
          key={label.id}
          className={`inline-flex items-center gap-1 rounded-full font-medium text-white ${getSizeClasses()}`}
          style={{ backgroundColor: label.color }}
        >
          {showIcon && <span className="text-xs">{label.icon}</span>}
          <span>{label.name}</span>
        </span>
      ))}
    </div>
  )
}

export default DietaryLabels
