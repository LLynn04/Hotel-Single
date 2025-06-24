import React, { useState, useEffect } from "react";

interface RoomType {
  id: number;
  type: string;
  price: number;
  capacity: number;
}

interface Room {
  id: number;
  room_number: string;
  desc: string;
  room_image: string;
  is_active: boolean;
  room_type: RoomType;
  created_at: string;
  updated_at: string;
}

const AddRoom: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const url = "https://api-hotel-production-ee3e.up.railway.app/api/rooms";

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const dataJson = await response.json();
        setRooms(dataJson.data);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  // Optional: fetch room types for dropdown if your API supports it
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await fetch("https://api-hotel-production-ee3e.up.railway.app/api/room-type");
        if (!res.ok) throw new Error("Failed to fetch room types");
        const data = await res.json();
        setRoomTypes(data.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchRoomTypes();
  }, []);

  const [form, setForm] = useState({
    room_number: "",
    desc: "",
    room_image: "",
    is_active: true,
    room_type_id: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setForm({
        ...form,
        [name]: target.checked,
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      // Optionally parse result if needed
      // const result = await response.json();

      // Refresh room list
      const updated = await fetch(url);
      const updatedJson = await updated.json();
      setRooms(updatedJson.data);

      // Reset form
      setForm({
        room_number: "",
        desc: "",
        room_image: "",
        is_active: true,
        room_type_id: "",
      });

      alert("Room added successfully!");
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to add room.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Room</h1>
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-white p-4 rounded shadow"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          name="room_number"
          placeholder="Room Number"
          className="border p-2 rounded"
          value={form.room_number}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="room_image"
          placeholder="Image URL"
          className="border p-2 rounded"
          value={form.room_image}
          onChange={handleChange}
          required
        />
        <textarea
          name="desc"
          placeholder="Description"
          className="border p-2 rounded col-span-1 md:col-span-2"
          rows={3}
          value={form.desc}
          onChange={handleChange}
          required
        ></textarea>
        <select
          name="room_type_id"
          className="border p-2 rounded"
          value={form.room_type_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Room Type</option>
          {roomTypes.length > 0
            ? roomTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.type} - ${type.price}
                </option>
              ))
            : (
                <>
                  <option value="1">Single Room</option>
                  <option value="2">Double Room</option>
                </>
              )}
        </select>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          <span>Is Active?</span>
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Room
          </button>
        </div>
      </form>

      <h2 className="text-xl font-semibold mb-3">Room List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white border rounded shadow">
            <img
              src={room.room_image}
              alt={room.room_number}
              className="w-full h-40 object-cover rounded-t"
            />
            <div className="p-3">
              <h3 className="font-bold text-lg">{room.room_number}</h3>
              <p className="text-gray-600">{room.desc}</p>
              <p className="text-sm mt-2">
                Type: <strong>{room.room_type.type}</strong> — $
                {room.room_type.price} | Capacity: {room.room_type.capacity}
              </p>
              <div className="flex justify-between items-center mt-4 text-sm">
                <span
                  className={room.is_active ? "text-green-600" : "text-red-600"}
                >
                  {room.is_active ? "Active" : "Inactive"}
                </span>
                <div className="space-x-2">
                  <button className="text-blue-600 hover:underline">Edit</button>
                  <button className="text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddRoom;
