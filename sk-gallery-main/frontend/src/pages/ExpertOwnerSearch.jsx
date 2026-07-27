import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ExpertOwnerSearch() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers('');
  }, []);

  const fetchUsers = async (searchQuery) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`https://sk-gallery-1.onrender.com/api/users/search?query=${searchQuery}`);
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(query);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Expert Search</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Find top artists and owners on the SK Art Gallery platform.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-12">
        <input 
          type="text" 
          placeholder="Search by name..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
        />
        <button type="submit" className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors">
          Search
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => (
            <div key={user._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-red-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full mt-2 font-medium ${user.role === 'owner' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                {user.role === 'owner' ? 'Owner / Expert' : 'Artist'}
              </span>
            </div>
          ))}
          {users.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">No experts found matching your search.</div>
          )}
        </div>
      )}
    </div>
  );
}


