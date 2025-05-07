import React from 'react';

type TagProps = {
  tags: string | null;
};

const SongTags: React.FC<TagProps> = ({ tags }) => {
  const tagArray = tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [];

  return (
    <div className="mt-2  mb-4 flex flex-wrap gap-2">
      {tagArray.map((tag, index) => (
        <span
          key={index}
          className="bg-indigo-50 text-indigo-700 text-s font-medium px-2.5 py-0.5 rounded-full"
        >
          {tag.trim()}
        </span>
      ))}
    </div>
  );
};

export default SongTags;
