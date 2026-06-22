import React from 'react';
import BottomTabBar from '../components/BottomTabBar';

const MainShell: React.FC<{ children: React.ReactNode; hideTab?: boolean }> = ({
  children,
  hideTab,
}) => (
  <div className={`dm-shell ${hideTab ? '' : 'dm-shell--tabs'}`}>
    <div className="dm-shell__body">{children}</div>
    {!hideTab && <BottomTabBar />}
  </div>
);

export default MainShell;
