import { useState, useEffect } from 'react';

interface RoomType {
  id: number;
  name: string;
  // Add other room type properties if needed
}

interface Room {
  id: number;
  room_number: string;
  desc: string;
  room_image: string;
  is_active: boolean;
  room_type: RoomType;
  images: string[];
  created_at: string;
  updated_at: string;
}

interface RoomCategory {
  id: number;
  name: string;
  image: string;
}

const Categories = () => {
  const url = "https://api-hotel-production-ee3e.up.railway.app/api/rooms";
  const [roomCategories, setRoomCategories] = useState<RoomCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomType = async () => {
      try {
        setLoading(true);
        const response = await fetch(url); // Fixed typo: respones -> response
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const dataJson = await response.json();
        console.log('Fetched data:', dataJson);
        
        // Extract unique room types from the rooms data
        const rooms = dataJson.data;
        const uniqueTypes = rooms.reduce((acc: RoomCategory[], room: any) => {
          // Check if this room type already exists
          const existingType = acc.find(item => item.id === room.room_type.id);
          if (!existingType) {
            acc.push({
              id: room.room_type.id,
              name: room.room_type.type, // "Single Room", "Twin Room", etc.
              image: room.room_image
            });
          }
          return acc;
        }, []);
        
        setRoomCategories(uniqueTypes);
      } catch (error) {
        console.error('Error fetching room categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoomType();
  }, []);

  const handleCategoryClick = (category: RoomCategory) => {
    console.log(`Selected category: ${category.name}`);
    // Add your navigation/filter logic here
  };

  if (loading) {
    return (
      <div className="py-16">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="w-full mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Room Categories
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {roomCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                  {category.name}
                </h3>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-400 rounded-2xl transition-colors duration-300"></div>
              
              {/* Click Indicator */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;