interface ChatUserMessageProps {
  content: string;
  avatar?: string;
}

const ChatUserMessage: React.FC<ChatUserMessageProps> = ({ content }) => {
  return (
    <div className="flex">
      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
        Y
      </div>
      <div className="flex-1">
        <p>{content}</p>
      </div>
    </div>
  );
};

export default ChatUserMessage;
