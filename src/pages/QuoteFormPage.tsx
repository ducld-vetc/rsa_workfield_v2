import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

/** Deep link /quotes/:id → inbox (P0: form gộp trong tab Báo giá) */
const QuoteFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  if (id) {
    return <Navigate to={`/quotes?order=${id}`} replace />;
  }
  return <Navigate to="/quotes" replace />;
};

export default QuoteFormPage;
