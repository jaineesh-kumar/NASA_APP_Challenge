// Page heading block used by every page outside the mission steps.

import React from 'react';

export const PageIntro: React.FC<{ title: string; lead?: string; kicker?: string }> = ({
  title,
  lead,
  kicker,
}) => (
  <div className="page-intro">
    {kicker ? <p className="page-kicker">{kicker}</p> : null}
    <h2 className="screen-title">{title}</h2>
    {lead ? <p className="page-lead">{lead}</p> : null}
  </div>
);
