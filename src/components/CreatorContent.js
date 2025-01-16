import React from 'react';
import { Trash2 } from 'lucide-react';

const CreatorContent = ({ creatorId, content, onDeleteContent }) => {
  if (!content || content.length === 0) {
    return <div className="text-center text-gray-500">No content available.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {content.map((item) => (
        <div key={item.id} className="bg-white shadow rounded-lg overflow-hidden">
          {item.fileUrl && (
            <div className="aspect-w-16 aspect-h-9">
              {item.fileUrl.endsWith('.mp4') ? (
                <video src={item.fileUrl} controls className="object-cover w-full h-full" />
              ) : (
                <img src={item.fileUrl} alt={item.title} className="object-cover w-full h-full" />
              )}
            </div>
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{new Date(item.uploadDate).toLocaleDateString()}</span>
              {!item.usedInMatch && (
                <button
                  onClick={() => onDeleteContent(item.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete content"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CreatorContent;