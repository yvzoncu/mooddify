import { FC } from 'react';

interface UserMessageProps {
  content: string;
}

const UserMessage: FC<UserMessageProps> = ({ content }) => {
  return (
    <div className="flex items-start space-x-3 bg-[#1c1c1c] p-3 rounded-2xl w-fit max-w-[90%]">
      {/* Avatar Circle */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#d6d3d1] text-black flex items-center justify-center font-semibold text-sm">
        Y
      </div>

      {/* Message Text */}
      <p className="text-white">{content}</p>
    </div>
  );
};

export default UserMessage;
