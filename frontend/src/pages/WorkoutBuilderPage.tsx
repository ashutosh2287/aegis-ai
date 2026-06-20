import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkoutBuilderPage = () => {
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Array<{
    id: string;
    name: string;
    muscleGroup: string;
    setCount: number;
  }>>([]);

  const isWorkoutNameValid = workoutName.length >= 3;

  const handleAddTestExercise = () => {
    const newExercise = {
      id: crypto.randomUUID(),
      name: 'Test Exercise',
      muscleGroup: 'Chest',
      setCount: 3,
    };
    setExercises(prev => [...prev, newExercise]);
  };

  const handleIncrementSet = (id: string) => {
    setExercises(prev =>
      prev.map(exercise =>
        exercise.id === id
          ? { ...exercise, setCount: Math.min(exercise.setCount + 1, 20) }
          : exercise
      )
    );
  };

  const handleDecrementSet = (id: string) => {
    setExercises(prev =>
      prev.map(exercise =>
        exercise.id === id
          ? { ...exercise, setCount: Math.max(exercise.setCount - 1, 1) }
          : exercise
      )
    );
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(prev => prev.filter(exercise => exercise.id !== id));
  };

  const handleSaveWorkout = () => {
    console.log({
      workoutName,
      exercises,
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Workout Builder</h1>

      {/* Workout Name Field */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Workout Name</label>
        <input
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          className={`block w-full px-4 py-2 border rounded-md ${
            !isWorkoutNameValid && workoutName.length > 0 ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Enter workout name (minimum 3 characters)"
        >
        </input>
        {!isWorkoutNameValid && workoutName.length > 0 && (
          <p className="text-xs text-red-500 mt-1">
            Workout name must be at least 3 characters long
          </p>
        )}
      </div>

      {/* Selected Exercises Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-4">Selected Exercises</h2>
        {exercises.length === 0 ? (
          <p className="text-gray-500">No exercises added yet</p>
        ) : (
          <AnimatePresence>
            {exercises.map((exercise) => (
              <motion.div
                key={exercise.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="border rounded-lg p-4 mb-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{exercise.name}</h3>
                  <p className="text-sm text-gray-600">
                    {exercise.muscleGroup}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleDecrementSet(exercise.id)}
                    disabled={exercise.setCount === 1}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{exercise.setCount}</span>
                  <button
                    onClick={() => handleIncrementSet(exercise.id)}
                    disabled={exercise.setCount === 20}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemoveExercise(exercise.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Temporary Testing Button */}
      <div className="mb-6">
        <button
          onClick={handleAddTestExercise}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Test Exercise
        </button>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveWorkout}
        disabled={!isWorkoutNameValid || exercises.length === 0}
        className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
          !isWorkoutNameValid || exercises.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Save Workout
      </button>
    </div>
  );
};

export default WorkoutBuilderPage;