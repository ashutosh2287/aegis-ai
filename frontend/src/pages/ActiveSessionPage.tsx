import { useParams } from 'react-router-dom';

export const ActiveSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Active Session</h1>
      <p className="text-gray-600">Active session placeholder for sessionId: {sessionId}</p>
    </div>
  );
};

export default ActiveSessionPage;