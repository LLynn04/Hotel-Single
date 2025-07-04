import { useState, useEffect } from "react";

interface RoomType {
  id: number;
  type: string;
  price: number;
  capacity: number;
  image?: string;
}

interface Room {
  room_type: Omit<RoomType, "image">;
  room_image: string;
}

const Categories = () => {
  const url = "https://api-hotel-production-ee3e.up.railway.app/api/rooms";
  const [roomCategories, setRoomCategories] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDataTyperoom = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`${response.status}`);
        }

        const dataJson = await response.json();
        const rooms: Room[] = dataJson.data;

        const uniqueRoomType: RoomType[] = [];
        const seenId = new Set();

        for (const room of rooms) {
          const roomType = room.room_type;
          if (!seenId.has(roomType.id)) {
            seenId.add(roomType.id);
            uniqueRoomType.push({
              id: roomType.id,
              type: roomType.type,
              price: roomType.price,
              capacity: roomType.capacity,
              image: room.room_image,
            });
          }
        }
        setRoomCategories(uniqueRoomType)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    };
    fetchDataTyperoom();
  }, []);

  const handleCategoryClick = (category: RoomType) => {
    console.log(`Selected category: ${category.type}`);
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
                  alt={category.type}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                  {category.type}
                </h3>
              </div>

              {/* Hover Border */}
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
