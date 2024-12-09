import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav aria-label="breadcrumb">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <p>asfgbdj</p>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return last ? (
            <span key={`${to}-${index}`}> {value} </span>
          ) : (
            <span key={`${to}-${index}`}>
              / <Link to={to}>{value}</Link>
            </span>
          );
        })}
      </div>
    </nav>
  );
};

export default Breadcrumbs;
