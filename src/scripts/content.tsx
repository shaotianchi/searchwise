import '../index.css';

import React from 'react';

import ReactDOM from 'react-dom/client';

export const FloatEntry = () => {
  return <div></div>
}

const searchWiseFloatEntry = document.createElement('div')
searchWiseFloatEntry.id = 'search-wise-float-entry'
document.appendChild(searchWiseFloatEntry)

ReactDOM.createRoot(searchWiseFloatEntry).render(
  <React.StrictMode>
    <FloatEntry />
  </React.StrictMode>
)
