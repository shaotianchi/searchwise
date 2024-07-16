import '../index.css';

import React, {
  useEffect,
  useState,
} from 'react';

import ReactDOM from 'react-dom/client';

import { ShadowDom } from '@/components/ui/shadow-dom';

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

function getFaviconUrl() {
  var linkElement = document.querySelector(
    'link[rel="icon"], link[rel="shortcut icon"]'
  ) as HTMLLinkElement
  return linkElement ? linkElement.href : undefined
}

export const FloatEntry = () => {
  const [status, setStatus] = useState(NoteStatus.Pending)
  const [showMain, setShowMain] = useState(false)
  const [currentNode, setCurrentNode] = useState<SearchQueueNode>()

  useEffect(() => {
    console.log(
      'document is ',
      document.getElementsByTagName('search-wise')[0],
      document.getElementsByTagName('search-wise')[0].shadowRoot,
      document
        .getElementsByTagName('search-wise')[0]
        .shadowRoot?.querySelector('#search-wise-float-entry'),
      document.getElementById('search-wise-float-entry')
    )
    Core.subscript<SearchQueueNode>(CoreEvent.NewPageVisite, (data) => {
      console.log('new page visite: ', data)
      if (data) {
        setStatus(NoteStatus.Noting)
      }
      setCurrentNode(data)
    })
    Core.visitpage(location.href, {
      title: document.title,
      icon: getFaviconUrl(),
    })
  }, [])

  const onButtonClick = () => {}

  return (
    <div id='search-wise-float-entry' className='fixed bottom-[120px] right-0'>
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
        <Sheet open={showMain} onOpenChange={setShowMain}>
          <SheetContent
            className='z-[99999999]'
            container={document
              .getElementsByTagName('search-wise')[0]
              ?.shadowRoot?.querySelector('#search-wise-float-entry')}
          >
            <SheetTitle>{`正在搜索：「${currentNode?.keyword}」`}</SheetTitle>
            <div className='mt-3 flex flex-col gap-2 items-center'>
              {currentNode?.pages?.map((page) => (
                <div key={page.url} className='hover:bg-slate-100'>
                  <div className='flex flex-row gap-1'>
                    <img src={page.meta.icon} className='w-[16px] h-[16px]' />
                    <a href={page.url} target='_blank'>
                      {page.meta.title}
                    </a>
                  </div>
                  <div className='text-[12px] text-gray-400'>{page.url}</div>
                </div>
              ))}
              <div
                role='button'
                className='absolute bottom-6 bg-blue-500 h-[44px] rounded-full w-[90%] flex items-center justify-center text-white text-lg font-bold'
              >
                Generate Note
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

const container = document.createDocumentFragment()
const root = ReactDOM.createRoot(container)
root.render(
  <ShadowDom parentElement={document.body} position='beforeend'>
    <React.StrictMode>
      <FloatEntry />
    </React.StrictMode>
  </ShadowDom>
)
