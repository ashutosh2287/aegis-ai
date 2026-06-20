import { useDraggable, useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { Exercise } from '../lib/exercise.types';

interface ExerciseWithSetCount extends Exercise {
  setCount: number;
}

interface WorkoutExerciseRowProps {
  exercise: ExerciseWithSetCount;
  index: number;
  onSetCountChange: (exerciseId: string, delta: number) => void;
  onRemove: (exerciseId: string) => void;
}

const WorkoutExerciseRow = ({
  exercise,
  index,
  onSetCountChange,
  onRemove,
}: WorkoutExerciseRowProps) => {
  const draggable = useDraggable({ id: `exercise-${index}` });
  const droppable = useDroppable({ id: `exercise-${index}` });
  const { attributes, listeners, setNodeRef, isDragging } = draggable;
  const { setNodeRef: setDroppableNodeRef, isOver } = droppable;

  const opacity = isDragging ? 0.5 : 1;
  const scale = isDragging ? 0.95 : 1;
  const backgroundColor = isOver ? '#e0f2fe' : 'white';

  return (
    <motion.div
      ref={node => {
        setNodeRef(node);
        setDroppableNodeRef(node);
      }}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity, y: 0, scale }}
      transition={{ duration: 0.2 }}
      className="workout-exercise-item"
      style={{
        opacity,
        scale,
        transition: 'opacity 0.2s, scale 0.2s',
        backgroundColor,
        border: isOver ? '2px dashed #0ea5e9' : 'none',
      }}
    >
      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-md">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-shrink-0">
            <h3 className="font-medium">{exercise.name}</h3>
            <p className="text-sm text-gray-500">
              {exercise.muscleGroup || 'N/A'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSetCountChange(exercise.id, -1)}
              disabled={exercise.setCount <= 1}
              className="p-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              –
            </button>
            <span className="w-8 text-center">{exercise.setCount}</span>
            <button
              onClick={() => onSetCountChange(exercise.id, 1)}
              disabled={exercise.setCount >= 20}
              className="p-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              +
            </button>
          </div>
        </div>
        <button
          onClick={() => onRemove(exercise.id)}
          className="text-red-500 hover:text-red-700"
        >
          Remove
        </button>
      </div>
    </motion.div>
  );
};

export default WorkoutExerciseRow;