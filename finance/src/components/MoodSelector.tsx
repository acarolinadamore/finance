import { Emotion } from '@/types/routine';

interface MoodSelectorProps {
  emotions: Emotion[];
  selectedEmotionIds: string[];
  onToggleEmotion: (emotionId: string) => void;
}

export const MoodSelector = ({
  emotions,
  selectedEmotionIds,
  onToggleEmotion,
}: MoodSelectorProps) => {
  const isSelected = (emotionId: string) => selectedEmotionIds.includes(emotionId);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Como você está se sentindo hoje?</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {emotions.map((emotion) => {
          const selected = isSelected(emotion.id);
          return (
            <button
              key={emotion.id}
              type="button"
              onClick={() => onToggleEmotion(emotion.id)}
              className={`
                flex flex-col items-center gap-1 p-3 rounded-lg
                transition-all duration-200 hover:scale-105
                ${
                  selected
                    ? 'ring-2 shadow-md'
                    : 'hover:bg-muted/50'
                }
              `}
              style={{
                backgroundColor: selected ? `${emotion.color}15` : 'transparent',
                borderColor: selected ? emotion.color : 'transparent',
                borderWidth: selected ? '2px' : '0',
              }}
            >
              <span className="text-2xl">{emotion.emoji}</span>
              <span
                className={`text-xs font-medium text-center ${
                  selected ? 'font-semibold' : 'text-muted-foreground'
                }`}
                style={{ color: selected ? emotion.color : undefined }}
              >
                {emotion.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
