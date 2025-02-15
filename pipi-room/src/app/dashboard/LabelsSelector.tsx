import { Checkbox } from "@/components/ui/checkbox"

interface LabelsSelectorProps {
  labels: any[]
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
      {labels.map((label: any) => (
        <div key={label.id} className="flex items-center space-x-2">
          <Checkbox
            id={label.id}
            checked={selectedLabelIds.includes(label.id)}
            onChange={() => handleCheckboxChange(label.id)}
          />
          <span>{label.name}</span>
        </div>
      ))}
    </div>
  )
}

