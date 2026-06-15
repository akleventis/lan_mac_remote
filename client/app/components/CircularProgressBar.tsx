import React from 'react';
import AnimatedProgressProvider from '../providers/AnimatedProgressProvider';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { easeQuadInOut } from 'd3-ease';
import usePrevious from '../hooks/usePrevious';
import {externalMediaSource} from '../api'

interface CircularProgressBarProps {
  volume: string;
  muted: boolean;
}

export const CircularProgressBar = ({ volume, muted }: CircularProgressBarProps) => {
  const prevVolume = usePrevious(volume);

  if (volume == externalMediaSource) {
    return (
      <></>
    )
  }

  return (
    <div style={{ width: '60px', margin: '10px', opacity: muted ? 0.35 : 1, transition: 'opacity 0.2s' }}>
      <AnimatedProgressProvider
        valueStart={prevVolume}
        valueEnd={volume}
        duration={1.4}
        easingFunction={easeQuadInOut}
      >
        {(volume: string) => {
          const roundedValue = Math.round(+volume);
          return (
            <CircularProgressbar
              strokeWidth={6}
              value={+volume}
              text={`${roundedValue}`}
              styles={buildStyles({
                rotation: 0.5,
                strokeLinecap: 'round',
                textSize: '24px',
                pathTransition: 'none',
                pathColor: `rgba(255, 255, 255)`,
                textColor: '#FFFFFF',
                trailColor: 'rgba(0, 0, 0, 0)',
                backgroundColor: '#3e98c7',
              })}
            />
          );
        }}
      </AnimatedProgressProvider>
    </div>
  );
};
