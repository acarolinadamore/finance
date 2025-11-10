import { Slider } from '@/components/ui/slider';
import { DAY_RATING_LABELS } from '@/types/routine';

interface DayRatingSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

export const DayRatingSlider = ({ value, onValueChange }: DayRatingSliderProps) => {
  const getRatingColor = (rating: number) => {
    if (rating <= 1) return '#dc2626'; // red
    if (rating === 2) return '#f97316'; // orange
    if (rating === 3) return '#f59e0b'; // amber
    if (rating === 4) return '#84cc16'; // lime
    return '#10b981'; // green
  };

  const color = getRatingColor(value);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Como foi seu dia?</p>
        <div className="flex items-center gap-2">
          <span
            className="text-2xl font-bold px-3 py-1 rounded-lg"
            style={{
              backgroundColor: `${color}15`,
              color: color
            }}
          >
            {value}
          </span>
          <span className="text-sm font-medium" style={{ color: color }}>
            {DAY_RATING_LABELS[value as keyof typeof DAY_RATING_LABELS]}
          </span>
        </div>
      </div>

      <div className="px-2">
        <Slider
          value={[value]}
          onValueChange={(values) => onValueChange(values[0])}
          min={0}
          max={5}
          step={1}
          className="w-full"
          style={{
            // @ts-ignore - Custom CSS variable for slider color
            '--slider-color': color,
          } as React.CSSProperties}
        />

        <div className="flex justify-between mt-2 px-1">
          {[0, 1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => onValueChange(rating)}
              className={`
                text-xs px-2 py-1 rounded transition-colors
                ${value === rating ? 'font-bold' : 'text-muted-foreground hover:bg-muted'}
              `}
              style={{
                color: value === rating ? getRatingColor(rating) : undefined,
                backgroundColor: value === rating ? `${getRatingColor(rating)}15` : undefined,
              }}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
