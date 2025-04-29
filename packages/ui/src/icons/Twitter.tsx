import React from 'react';
import { Path } from 'react-native-svg';
import { withIconBehavior } from './withIconBehavior';

// Define just the SVG content for Twitter icon
const TwitterIconContent = () => (
  <>
    <Path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <Path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <Path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </>
);

// Create the enhanced icon component
export const TwitterIcon = withIconBehavior(TwitterIconContent);
