import React, { useState, useEffect } from "react";

interface RoomAPI {
  id: number;
  room_number: string;
  desc: string;
  room_image: string;
  is_active: boolean;
  room_type: {
    id: number;
    type: string;
    price: number;
    capacity: number;
  };
  images: string[];
  created_at: string;
  updated_at: string;
}

interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  availability: "available" | "occupied" | "maintenance";
  type: string;
}

const RoomFilter: React.FC = () => {
  const [filters, setFilters] = useState({
    type: "all",
    bed: "any",
    guest: "any",
    wifi: false,
    breakfast: false,
    parking: false,
  });
  const [loading, setLoading] = useState(true);
  const [RoomFilter, setRoomFilter] = useState<Room[]>([]);
  const url = 'https://api-hotel-production-ee3e.up.railway.app/api/rooms';

  useEffect(() => {
    const FetchFilterRoom = async () => {
      try {
        setLoading(true)
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error (`${response.status}`)
        }

        const dataJson = await response.json();
        const data: RoomAPI[] = dataJson.data;

        const mappedFilter: Room[] = data.map((showRoom) => ({
          id: showRoom.id.toString(),
          name: showRoom.room_number,
          description: showRoom.desc,
          price: showRoom.room_type.price,
          image: showRoom.room_image,
          availability: showRoom.is_active ? "available" : "maintenance",
          type: showRoom.room_type.type,
        }))

        setRoomFilter(mappedFilter)

      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    FetchFilterRoom();
  },[])

  if (loading) {
    return (
      <div className="py-16 flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFilters({
      ...filters,
      [name]: newValue,
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen p-4 gap-4">
      {/* Filter Section */}
      <div className="md:w-1/4 bg-white shadow rounded-lg p-4 space-y-4">
        <h2 className="text-xl font-semibold mb-2">Filter Rooms</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Room Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          >
            <option value="all">All</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="suite">Suite</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bed Type</label>
          <select
            name="bed"
            value={filters.bed}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          >
            <option value="any">Any</option>
            <option value="king">King</option>
            <option value="queen">Queen</option>
            <option value="twin">Twin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Guests</label>
          <select
            name="guest"
            value={filters.guest}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          >
            <option value="any">Any</option>
            <option value="1">1 Guest</option>
            <option value="2">2 Guests</option>
            <option value="3">3 Guests</option>
            <option value="4+">4+ Guests</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="wifi"
            checked={filters.wifi}
            onChange={handleChange}
          />
          <label>Free Wi-Fi</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="breakfast"
            checked={filters.breakfast}
            onChange={handleChange}
          />
          <label>Breakfast Included</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="parking"
            checked={filters.parking}
            onChange={handleChange}
          />
          <label>Parking</label>
        </div>
      </div>

      {/* Room Display Section */}
      <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RoomFilter.map((room) => (
          <div
            key={room.id}
            className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200"
          >
            <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-500">
              <img src={room.image} alt={room.type} />
            </div>
            <div className="p-4 space-y-2">
              <h3 className="text-lg font-semibold">{room.name}</h3>
              <p className="text-sm text-gray-600">{room.description}</p>
              <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomFilter;
