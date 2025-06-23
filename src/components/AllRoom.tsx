import React, { useEffect, useState } from "react";
import AllRoomCard from "./AllRoomCard";
import { useNavigate } from "react-router-dom";

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
  price: number;
  image: string;
  availability: "available" | "occupied" | "maintenance";
}

const AllRoom: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const url = "https://api-hotel-production-ee3e.up.railway.app/api/rooms";

  useEffect(() => {
    const FetchAllRoom = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`${response.status}`);
        }

        const dataJson = await response.json();
        const data: RoomAPI[] = dataJson.data;

        const mappedRoom: Room[] = data.map((room) => ({
          id: room.id.toString(),
          name: room.room_number,
          price: room.room_type.price,
          image: room.room_image,
          availability: room.is_active ? "available" : "maintenance",
        }));

        setRooms(mappedRoom);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    FetchAllRoom();
  }, []);

  const handleRoomClick = (room: Room) => {
    navigate(
      `/rooms?type=${encodeURIComponent(room.name)}&availability=${
        room.availability
      }`
    );
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full py-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Our Rooms</h2>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading rooms...</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-6 pb-2 scroll-smooth no-scrollbar">
              {rooms.map((room) => (
                <AllRoomCard key={room.id} room={room} onClick={()=> handleRoomClick(room)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRoom;
