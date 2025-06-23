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
  const getStatusConfig = (status: Room['availability']) => {
    switch (status) {
      case 'available':
        return { color: 'text-emerald-500', bg: 'bg-emerald-50', dot: 'bg-emerald-500' };
      case 'occupied':
        return { color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-500' };
      case 'maintenance':
        return { color: 'text-amber-500', bg: 'bg-amber-50', dot: 'bg-amber-500' };
    }
  };

  const statusConfig = getStatusConfig(room.availability);

  return (
    <div 
      className="group relative w-[320px] flex-shrink-0 bg-white border border-gray-100 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusConfig.bg} backdrop-blur-sm`}>
          <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
          <span className={`text-xs font-medium capitalize ${statusConfig.color}`}>
            {room.availability}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {room.name}
          </h3>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">${room.price}</span>
            <span className="text-sm text-gray-500">/night</span>
          </div>
          
          <div className="flex items-center text-gray-400 group-hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Subtle gradient border effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default AllRoomCard;