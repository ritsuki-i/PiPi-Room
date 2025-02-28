import { Checkbox } from "@/components/ui/checkbox"
import { LabelType } from "@/types"

interface LabelsSelectorProps {
  labels: LabelType[]
  selectedLabelIds: string[]
  setSelectedLabelIds: (ids: string[]) => void
}

export default function LabelsSelector({ labels, selectedLabelIds, setSelectedLabelIds }: LabelsSelectorProps) {
  const handleCheckboxChange = (labelId: string) => {
    const updatedIds = selectedLabelIds.includes(labelId)
      ? selectedLabelIds.filter((id) => id !== labelId)
      : [...selectedLabelIds, labelId]
    setSelectedLabelIds(updatedIds)
  }

  return (
    <div>
      {labels.map((label) => (
        <div key={label.id} className="flex items-center space-x-2">
          <Checkbox
            id={label.id.toString()}
            checked={selectedLabelIds.includes(label.id.toString())}
            onChange={() => handleCheckboxChange(label.id.toString())}
          />
          <span>{label.name}</span>
        </div>
      ))}
    </div>
  )
}

