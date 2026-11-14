// Rules step: who gets power first, and the if-then rules (Spec B5.2; L6 AC4, AC5)

import React from 'react';
import { copy } from '../../content/copy.ts';
import { loadParams } from '../../engine/params.ts';
import { Icon } from '../components/Icon.tsx';
import { PriorityLadder } from '../components/PriorityLadder.tsx';
import { RuleEditor } from '../components/RuleEditor.tsx';
import { WhyThisNumber } from '../components/WhyThisNumber.tsx';

const params = loadParams();

export const RulesScreen: React.FC = () => (
  <div>
    <h2 className="screen-title">{copy.rules.heading}</h2>
    <p className="muted" style={{ marginBottom: 16 }}>
      {copy.rules.subheading}
    </p>

    <p className="notice" style={{ marginBottom: 24 }}>
      <Icon name="antenna" size={20} />{' '}
      <span>
        {copy.rules.commsNote}{' '}
        {copy.rules.delayNote(
          params.getNumber('comms.moon_one_way_delay_s'),
          params.getNumberArray('comms.earth_mars_light_delay_min'),
        )}
        <WhyThisNumber paramId="comms.moon_one_way_delay_s" />
      </span>
    </p>

    <div className="grid-2col">
      <div>
        <PriorityLadder />
      </div>
      <div>
        <RuleEditor />
      </div>
    </div>
  </div>
);
