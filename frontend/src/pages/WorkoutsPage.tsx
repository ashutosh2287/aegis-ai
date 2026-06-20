import { useWorkouts } from '../hooks/useWorkouts';
import { sessionService } from '../lib/session.service';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Workout } from '../lib/workout.types';

export const WorkoutsPage = () => {
  const { workouts, isLoading, error } = useWorkouts();
  const navigate = useNavigate();

  const handleStartWorkout = async (workoutId: string) => {
    try {
      const session = await sessionService.createSession(workoutId);
      // Navigate to active session screen, passing sessionId and workoutId via state
      navigate(`/app/session/${session.id}`, { state: { workoutId } });
    } catch (err) {
      console.error('Failed to start workout session:', err);
      // TODO: Show error toast or notification
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Workouts</h1>
          <button
            onClick={() => navigate('/app/workout-builder')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            New Workout
          </button>
        </div>
        {/* Loading skeletons */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg p-4 shadow-md"
            >
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                <span className="text-xs text-gray-500">Muscle groups</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                <span className="text-xs text-gray-500">Last performed</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Workouts</h1>
          <button
            onClick={() => navigate('/app/workout-builder')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            New Workout
          </button>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-medium">Error loading workouts</p>
          <p className="mt-1 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Workouts</h1>
          <button
            onClick={() => navigate('/app/workout-builder')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            New Workout
          </button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't created any workouts yet.</p>
          <button
            onClick={() => navigate('/app/workout-builder')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Create Your First Workout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Workouts</h1>
        <button
          onClick={() => navigate('/app/workout-builder')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          New Workout
        </button>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {workouts.map((workout) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: workouts.indexOf(workout) * 0.05 }}
            className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleStartWorkout(workout.id)}
          >
            <div className="mb-2">
              <h2 className="text-xl font-medium">{workout.name}</h2>
              {workout.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{workout.description}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {/* Exercise Count Badge */}
              <span
                className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded"
              >
                {workout.workoutExercises?.length || 0} exercises
              </span>
              {/* Muscle Group Tags */}
              {getMuscleGroupTags(workout).map((muscleGroup, index) => (
                <span
                  key={index}
                  className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded"
                >
                  {muscleGroup}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between">
              {/* Last Performed Badge - Placeholder until backend provides lastPerformed field */}
              <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                Backend dependency: lastPerformed field required
              </span>
              {/* Start Workout button is the entire card clickable */}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Helper function to extract and deduplicate muscle group tags from workout
const getMuscleGroupTags = (workout: Workout): string[] => {
  const muscleGroups = workout.workoutExercises
    ?.map((we) => we.exercise?.muscleGroup)
    .filter((mg): mg is string => !!mg) || [];
  // Deduplicate while preserving order
  return [...new Set(muscleGroups)];
};

export default WorkoutsPage;