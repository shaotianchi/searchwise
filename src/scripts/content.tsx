import '../index.css';

import React, {
  useEffect,
  useState,
} from 'react';

import ReactDOM from 'react-dom/client';

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '../components/ui/sheet';
import Core, {
  CoreEvent,
  SearchQueueNode,
} from '../core';

enum NoteStatus {
  Pending,
  Noting,
  Pause,
}

export const FloatEntry = () => {
  const [status, setStatus] = useState(NoteStatus.Pending)
  const [showMain, setShowMain] = useState(false)
  const [currentNode, setCurrentNode] = useState<SearchQueueNode>()

  useEffect(() => {
    Core.subscript(CoreEvent.StartNote, () => {
      setStatus(NoteStatus.Noting)
    })
    Core.subscript<SearchQueueNode>(CoreEvent.NewPageVisite, (data) => {
      setCurrentNode(data)
    })
    Core.visitepage(location.href)
  }, [])

  const onButtonClick = () => {}

  return (
    <div className='flex flex-col items-end gap-2'>
      <div className='w-[32px] h-[32px] rounded-full bg-white shadow-sm flex items-center justify-center mr-[8px]'>
        <div
          className='flex items-center justify-center w-[28px] h-[28px] rounded-full hover:bg-blue-300 cursor-pointer text-blue-500'
          onClick={onButtonClick}
        >
          {status === NoteStatus.Pending && '等'}
          {status === NoteStatus.Noting && '录'}
          {status === NoteStatus.Pause && '停'}
        </div>
      </div>
      <div
        className='w-[75px] h-[36px] cursor-pointer'
        onClick={() => setShowMain(true)}
      >
        <img
          src={chrome.runtime.getURL('src/assets/entry.png')}
          className='w-[75px] h-[36px]'
        />
      </div>
      <Sheet open={showMain}>
        <SheetContent className='z-[99999999]'>
          <SheetTitle>{`正在搜索：「${currentNode?.keyword}」`}</SheetTitle>
          <div></div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

const searchWiseFloatEntry = document.createElement('div')
searchWiseFloatEntry.id = 'search-wise-float-entry'
searchWiseFloatEntry.style.position = 'fixed'
searchWiseFloatEntry.style.bottom = '120px'
searchWiseFloatEntry.style.right = '0px'
document.body.appendChild(searchWiseFloatEntry)

ReactDOM.createRoot(searchWiseFloatEntry).render(
  <React.StrictMode>
    <FloatEntry />
  </React.StrictMode>
)
