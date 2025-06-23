import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Room {
  id: string;
  name: string;
  price: number;
  image: string;
  availability: 'available' | 'occupied' | 'maintenance';
  type: string;
}

// Utility: parse URL query params into an object
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const RoomFilter: React.FC = () => {
  const navigate = useNavigate();
  const query = useQuery();

  const [rooms, setRooms] = useState<Room[]>([]); // all rooms fetched
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);

  // Filters state
  const [filterType, setFilterType] = useState<string>(query.get('type') || '');
  const [filterAvailability, setFilterAvailability] = useState<string>(query.get('availability') || '');

  // Fetch rooms once
  useEffect(() => {
    // Replace with your actual fetch logic
    async function fetchRooms() {
      const res = await fetch('https://api-hotel-production-ee3e.up.railway.app/api/rooms');
      const json = await res.json();

      const mappedRooms: Room[] = json.data.map((item: any) => ({
        id: item.id.toString(),
        name: item.room_number,
        price: item.room_type?.price || 0,
        image: item.room_image,
        availability: item.is_active ? 'available' : 'maintenance',
        type: item.room_type?.type || '',
      }));
      setRooms(mappedRooms);
    }

    fetchRooms();
  }, []);

  // Filter rooms whenever filters or rooms change
  useEffect(() => {
    let filtered = rooms;

    if (filterType) {
      filtered = filtered.filter((r) => r.type === filterType);
    }

    if (filterAvailability) {
      filtered = filtered.filter((r) => r.availability === filterAvailability);
    }

    setFilteredRooms(filtered);
  }, [rooms, filterType, filterAvailability]);

  // Update URL query params when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filterType) params.set('type', filterType);
    if (filterAvailability) params.set('availability', filterAvailability);

    navigate({ pathname: '/rooms', search: params.toString() }, { replace: true });
  }, [filterType, filterAvailability, navigate]);

  return (
    <div className="flex min-h-screen">
      {/* Filters sidebar */}
      <aside className="w-64 bg-gray-100 p-4 shadow-md">
        <h2 className="font-bold mb-4">Filters</h2>

        <div className="mb-6">
          <label className="block font-semibold mb-1">Room Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">All</option>
            <option value="Single Room">Single Room</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
            {/* Add more types as needed */}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Availability</label>
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </aside>

      {/* Rooms list */}
      <main className="flex-1 p-6 bg-white overflow-auto">
        {filteredRooms.length === 0 ? (
          <p>No rooms found with current filters.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div key={room.id} className="border rounded shadow overflow-hidden">
                <img src={room.image} alt={room.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-bold text-lg">{room.name}</h3>
                  <p className="text-gray-600">${room.price}</p>
                  <p className="text-sm text-gray-500 capitalize">{room.availability}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RoomFilter;
