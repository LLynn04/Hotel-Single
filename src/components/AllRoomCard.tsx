import React from 'react';

interface Room {
  id: string;
  name: string;
  price: number;
  image: string;
  availability: 'available' | 'occupied' | 'maintenance';
}

interface Props {
  room: Room;
  onClick?: () => void;
}

const AllRoomCard: React.FC<Props> = ({ room, onClick }) => {
  return (
    <div className="w-[300px] flex-shrink-0 bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105" onClick={onClick}>
        
      <img
        src={room.image}
        alt={room.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{room.name}</h3>
        <p className="text-gray-600 mb-1 text-sm">Price: <span className="font-medium text-black">${room.price}</span></p>
        <p
          className={`text-sm font-medium ${
            room.availability === 'available' ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {room.availability}
        </p>
      </div>
    </div>
  );
};

export default AllRoomCard;
