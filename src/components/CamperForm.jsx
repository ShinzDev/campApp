import { useState } from 'react';
import { supabase } from '../supabase/client';

export default function CamperForm({ onRegistered }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from('campers')
      .insert([{ name, present: false }])
      .select()
      .single();

    if (error) {
      console.error(error.message);
    } else {
      onRegistered(data); // pass camper data back
      setName('');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold">Register Camper</h2>
      <input
        type="text"
        placeholder="Camper Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Registering...' : 'Register Camper'}
      </button>
    </form>
  );
}
