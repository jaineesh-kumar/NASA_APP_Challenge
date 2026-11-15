// Rules step: tabs for who gets power first, the if-then rules and the radio delay
// (Spec B5.2; L6 AC4, AC5)

import React from 'react';
import { copy } from '../../content/copy.ts';
import { loadParams } from '../../engine/params.ts';
import { Icon } from '../components/Icon.tsx';
import { PriorityLadder } from '../components/PriorityLadder.tsx';
import { RuleEditor } from '../components/RuleEditor.tsx';
import { RuleSwitches } from '../components/RuleSwitches.tsx';
import { SectionTabs } from '../components/SectionTabs.tsx';
import { StepHeader } from '../components/StepHeader.tsx';
import { useAppStore } from '../../state/store.tsx';
import { WhyThisNumber } from '../components/WhyThisNumber.tsx';

const params = loadParams();

export const RulesScreen: React.FC = () => {
  const { state } = useAppStore();
  const tabs = copy.stepTabs.rules;
  return (
    <div>
      <StepHeader step="rules" title={copy.rules.heading} lead={copy.rules.subheading} />

      <SectionTabs
        label={copy.stepTabs.listLabel(copy.nav.rules)}
        tabs={[
          { id: 'ladder', label: tabs.ladder, content: <PriorityLadder /> },
          {
            id: 'if-then',
            label: tabs.ifThen,
            content: state.mode === 'junior' ? <RuleSwitches /> : <RuleEditor />,
          },
          {
            id: 'comms',
            label: tabs.comms,
            content: (
              <p className="notice">
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
            ),
          },
        ]}
      />
    </div>
  );
};
