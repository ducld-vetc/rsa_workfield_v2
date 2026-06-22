import React from 'react';
import { Check } from 'lucide-react';
import { JOB_STAGE_LABELS, JobStage } from '../types';

const STAGES: JobStage[] = ['da-nhan', 'da-den-diem', 'dang-keo', 'hoan-thanh'];

const stageIndex = (s: JobStage) => STAGES.indexOf(s);

export const JobStepper: React.FC<{ current: JobStage }> = ({ current }) => {
  const active = stageIndex(current);

  return (
    <div className="dm-stepper">
      {STAGES.map((stage, i) => {
        const done = i < active;
        const on = i === active;
        return (
          <React.Fragment key={stage}>
            <div className={`dm-stepper__node ${done ? 'dm-stepper__node--done' : ''} ${on ? 'dm-stepper__node--on' : ''}`}>
              <span className="dm-stepper__dot">
                {done ? <Check size={12} strokeWidth={3} /> : i + 1}
              </span>
              <span className="dm-stepper__label">{JOB_STAGE_LABELS[stage]}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`dm-stepper__line ${i < active ? 'dm-stepper__line--done' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
