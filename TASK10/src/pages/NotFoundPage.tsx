import type React from "react";
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage: React.FC=() => {
    return (
        <div className="not-found-page">
            <h1>404</h1>
            <p>Страница не найдена</p>
            <Link to="/dashboard" className="back-link">
                Вернуться на главную
            </Link>
        </div>
    );
};
export default NotFoundPage;