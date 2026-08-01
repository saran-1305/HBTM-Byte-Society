import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PublishingCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state) {
      // Exchange code for token via backend
      fetch(`http://localhost:8000/api/publishing/callback?code=${code}&state=${state}`)
        .then(res => res.json())
        .then(data => {
          console.log('Account connected', data);
          navigate('/publishing');
        })
        .catch(err => {
          console.error('Error connecting account', err);
          navigate('/publishing');
        });
    } else {
      navigate('/publishing');
    }
  }, [searchParams, navigate]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <div className="text-white text-lg animate-pulse">Connecting to LinkedIn...</div>
    </div>
  );
};

export default PublishingCallback;
