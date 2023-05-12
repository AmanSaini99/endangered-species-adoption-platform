import React from 'react';
import '../style/styles.css';

export const Welcome = () => {
  console.log(process.env.REACT_APP_I);
  return (
    <h1 className='styled-heading-main'>Welocme to Endangered Species Adoption Platform</h1>
  );
};