import { useState, useEffect } from 'react';
import { useExercises } from '../hooks/useExercises';
import ExerciseSearchItem from './ExerciseSearchItem';

interface Exercise {
  id: string;
  name: string;
  muscleGroup?: string;
  equipment?: string;
}

const ExerciseSearchPanel = () => {
  const { searchExercises } = useExercises();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Search exercises when debounced term changes
  useEffect(() => {
    let isCancelled = false;

    if (debouncedSearchTerm.trim() === '') {
      setSearchResults([]);
      setSearchError(null);
    } else {
      setSearchLoading(true);
      setSearchError(null);
      searchExercises(debouncedSearchTerm)
        .then((results) => {
          if (!isCancelled) {
            setSearchResults(results);
            setSearchLoading(false);
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            setSearchError(err instanceof Error ? err.message : 'Unknown error');
            setSearchLoading(false);
          }
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearchTerm, searchExercises]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSearchError(null);
  };


  if (searchLoading && !searchResults.length && !searchError) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Searching exercises...</p>
      </div>
    );
  }

  if (searchError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3">
        <p>{searchError}</p>
      </div>
    );
  }

  if (!searchLoading && searchResults.length === 0 && searchTerm.trim() !== '' && !searchError) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No exercises found for "{searchTerm}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search exercises..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchLoading && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      {searchResults.length > 0 && (
        <div className="space-y-3">
          {searchResults.map((exercise) => (
            <ExerciseSearchItem exercise={exercise} key={exercise.id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseSearchPanel;