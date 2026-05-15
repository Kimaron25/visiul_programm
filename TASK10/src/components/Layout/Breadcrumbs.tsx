import React from "react";
import { useLocation } from "react-router-dom";
import { Link } from 'react-router-dom';
import './Breadcrumbs.css';

interface BreadcrumbsProps {
    documentName?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ documentName})=> {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);
    const getBreadcrumbName = (path: string, index: number): string => {
        if(path === 'dashboard') return 'Мои документы';
        if(path === 'profile') return 'Профиль';
        if(path === 'documents' && documentName) return documentName;
        return path;
    };
    return (
        <div className="breadcrumbs">
            <Link to="/dashboard" className="breadcrumb-link">
                Главная
            </Link>
            {pathnames.map((name, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                const displayName = getBreadcrumbName(name, index);

                return (
                    <React.Fragment key={routeTo}>
                        <span className="breadcrumb-separator"> - </span>
                        {isLast ? (
                            <span className="breadcrumb-current">{displayName}</span>
                        ) : (
                            <Link to={routeTo} className="breadcrumb-link">
                                {displayName}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    ); 
};
export default Breadcrumbs;