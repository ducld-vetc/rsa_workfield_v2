import React from 'react';
import { UserRound } from 'lucide-react';
import { HandlerDisplay } from '../utils/orderHandler';

interface OrderHandlerLineProps {
  display: HandlerDisplay;
}

const OrderHandlerLine: React.FC<OrderHandlerLineProps> = ({ display }) => {
  if (!display.text) return null;

  return (
    <p className={`order-handler-line order-handler-line--${display.tone}`}>
      <UserRound size={14} strokeWidth={2.25} aria-hidden />
      <span>{display.text}</span>
    </p>
  );
};

export default OrderHandlerLine;
