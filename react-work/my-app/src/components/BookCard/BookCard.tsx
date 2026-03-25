import React, { useEffect, useState } from 'react';
import './BookCard.css';

interface BookCardProps {
  title: string;
  authors: string[];
  imageBlob?: Blob | null;
}

const BookCard: React.FC<BookCardProps> = ({ title, authors, imageBlob }) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (imageBlob) {
      const url = URL.createObjectURL(imageBlob);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageBlob]);

  return (
    <div className="book-card">
      <div className="book-cover">
        {imageUrl ? (
          <img src={imageUrl} alt={title} />
        ) : (
          <div className="placeholder-image">
            📚
          </div>
        )}
      </div>
      <h3 className="book-title">{title}</h3>
      <p className="book-authors">{authors.join(', ')}</p>
    </div>
  );
};

export default BookCard;