import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import WorkoutExerciseRow from './WorkoutExerciseRow';
import type { Exercise } from '../lib/exercise.types';

interface ExerciseWithSetCount extends Exercise {
  setCount: number;
}

interface WorkoutDropZoneProps {
  exercises: ExerciseWithSetCount[];
  onExerciseRemove: (exerciseId: string) => void;
  onSetCountChange: (exerciseId: string, delta: number) => void;
}

const WorkoutDropZone = ({
  exercises,
  onExerciseRemove,
  onSetCountChange,
}: WorkoutDropZoneProps) => {
  const droppable = useDroppable({ id: 'drop-zone' });
  const { isOver, setNodeRef } = droppable;

  const backgroundColor = isOver ? '#e0f2fe' : 'white';

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex flex-col"
      style={{
        backgroundColor,
        border: isOver ? '2px dashed #0ea5e9' : 'none',
      }}
    >
      {exercises.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Drag exercises from the left to build your workout
        </div>
      ) : (
        <AnimatePresence>
          {exercises.map((exercise, index) => (
            <WorkoutExerciseRow
              key={`${exercise.id}-${index}`}
              exercise={exercise}
              index={index}
              onSetCountChange={onSetCountChange}
              onRemove={onExerciseRemove}
            />
          ))}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default WorkoutDropZone;