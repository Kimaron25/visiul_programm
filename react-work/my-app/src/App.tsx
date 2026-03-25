import React, { useEffect, useState } from 'react';
import BookCard from './components/BookCard/BookCard';
import './App.css';

interface Book {
  id: number;
  title: string;
  isbn: string;
  pageCount: number;
  authors: string[];
}

interface BookWithImage extends Book {
  imageBlob?: Blob | null;
}

function App() {
  const [books, setBooks] = useState<BookWithImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Получение обложки через прокси
  const fetchBookCover = async (isbn: string): Promise<Blob | null> => {
    try {
      // 1. Получаем информацию о книге через прокси
      const infoResponse = await fetch(`/google-books-api/books/v1/volumes?q=isbn:${isbn}`);
      const data = await infoResponse.json();
      
      if (data.items && data.items[0]?.volumeInfo?.imageLinks?.thumbnail) {
        let imageUrl = data.items[0].volumeInfo.imageLinks.thumbnail;
        // Извлекаем путь к изображению
        const urlPath = new URL(imageUrl).pathname + new URL(imageUrl).search;
        
        // 2. Загружаем изображение через прокси для обхода CORS
        const imageResponse = await fetch(`/book-images${urlPath}`);
        const imageBlob = await imageResponse.blob();
        return imageBlob;
      }
      return null;
    } catch (error) {
      console.error(`Ошибка загрузки обложки для ISBN ${isbn}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        
        // Загружаем список книг из API
        const response = await fetch('https://fakeapi.extendsclass.com/books');
        if (!response.ok) {
          throw new Error(`HTTP ошибка: ${response.status}`);
        }
        const booksData: Book[] = await response.json();
        
        // Берем первые 10 книг, чтобы не было 429 ошибки от Google Books API
        const limitedBooks = booksData.slice(0, 10);
        
        // Загружаем обложки для каждой книги
        const booksWithImages = await Promise.all(
          limitedBooks.map(async (book) => {
            const imageBlob = await fetchBookCover(book.isbn);
            return { ...book, imageBlob };
          })
        );
        
        setBooks(booksWithImages);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке книг');
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка книг и обложек...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p> Ошибка: {error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 Каталог книг</h1>
        <p className="book-count">Загружено книг: {books.length}</p>
      </header>
      <div className="books-grid">
        {books.map((book) => (
          <BookCard
            key={book.id}
            title={book.title}
            authors={book.authors}
            imageBlob={book.imageBlob}
          />
        ))}
      </div>
    </div>
  );
}

export default App;