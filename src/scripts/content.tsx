import '../index.css';

import React from 'react';

import ReactDOM from 'react-dom/client';

export const FloatEntry = () => {
  return (
    <div>
      <div className='w-[44px] h-[44px] rounded-full bg-purple-500'></div>
    </div>
  )
}

const searchWiseFloatEntry = document.createElement('div')
searchWiseFloatEntry.id = 'search-wise-float-entry'
document.body.appendChild(searchWiseFloatEntry)

console.log('dsafjdajfiodsjaiofsdjaiofs')

ReactDOM.createRoot(searchWiseFloatEntry).render(
  <React.StrictMode>
    <FloatEntry />
  </React.StrictMode>
)
