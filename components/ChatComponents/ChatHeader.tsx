import { Layers, Edit2, User } from 'lucide-react';

const ChatHeader = () => {
  return (
    <header className="flex flex-shrink-0 justify-between items-center p-4 border-b border-gray-800 ">
      <div className="flex space-x-4">
        <button className="p-2 rounded-lg bg-gray-800">
          <Layers size={20} />
        </button>
        <button className="p-2 rounded-lg bg-gray-800">
          <Edit2 size={20} />
        </button>
      </div>
      <h1 className="text-xl font-bold">Moodify</h1>
      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden ">
        <User size={20} />
      </div>
    </header>
  );
};

export default ChatHeader;
