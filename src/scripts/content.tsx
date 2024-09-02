import '../index.css'

import React, { useEffect, useState } from 'react'

import ReactDOM from 'react-dom/client'
import Markdown from 'react-markdown'

import Loading from '@/components/ui/loading'
import { ShadowDom } from '@/components/ui/shadow-dom'
import { get, StorageKeys } from '@/lib/storage'
import { ArchiveIcon, Cross1Icon, GearIcon } from '@radix-ui/react-icons'

import Core, { CoreEvent, SearchQueueNode } from '../core'

enum NoteStatus {
  Pending,
  Noting,
  Pause,
}

function getFaviconUrl() {
  const linkElement = document.querySelector(
    'link[rel="icon"], link[rel="shortcut icon"]'
  ) as HTMLLinkElement
  return linkElement ? linkElement.href : undefined
}

export const FloatEntry = () => {
  const [status, setStatus] = useState(NoteStatus.Pending)
  const [showMain, setShowMain] = useState(false)
  const [currentNode, setCurrentNode] = useState<SearchQueueNode>()
  const [nodes, setNodes] = useState<SearchQueueNode[]>([])

  useEffect(() => {
    get<SearchQueueNode[]>(StorageKeys.SearchNotes).then((data) =>
      setNodes(data || [])
    )
  }, [])

  useEffect(() => {
    Core.subscript<SearchQueueNode>(CoreEvent.NewPageVisite, (data) => {
      if (data) {
        setStatus(NoteStatus.Noting)
      }
      setCurrentNode(data && { ...data })
    })

    Core.subscript<SearchQueueNode>(CoreEvent.BeginGenerate, (data) => {
      setCurrentNode(data && { ...data })
    })

    Core.subscript<SearchQueueNode>(CoreEvent.GenerateResult, (data) => {
      setCurrentNode(data && { ...data })
    })
    Core.visitpage(location.href, {
      title: document.title,
      desc: document
        .querySelector('meta[name="description"]')
        ?.getAttribute('content'),
    })
  }, [])

  const onButtonClick = () => {}

  const onGenerateNote = () => {
    Core.generateCurrent()
  }

  return (
    <div
      id='search-wise-float-entry'
      className='fixed bottom-[120px] right-0 z-[2147483647]'
    >
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
        {showMain && (
          <div className='fixed top-0 bottom-0 right-0 w-[40%] min-w-[400px] h-full bg-white py-3 pl-3'>
            <div className='flex flex-row h-full overflow-hidden'>
              <div className='flex-1 overflow-y-scroll overflow-x-hidden overscroll-contain no-scrollbar text-black'>
                {(!currentNode?.status ||
                  currentNode?.status === 'pending') && (
                  <>
                    <div className='font-bold text-xl'>{`正在搜索：「${currentNode?.keyword}」`}</div>
                    <div className='mt-3 flex flex-col gap-2 items-center pb-[70px]'>
                      {currentNode?.pages?.map((page) => (
                        <div
                          key={page.url}
                          className='hover:bg-slate-100 flex flex-col items-start justify-center w-full px-2 py-3 rounded-sm'
                        >
                          <div className='flex flex-row gap-1'>
                            {/* <img
                              src={page.meta.icon}
                              className='w-[16px] h-[16px] mt-[4px]'
                            /> */}
                            <a
                              href={page.url}
                              target='_blank'
                              className='line-clamp-2 font-bold'
                            >
                              {page.meta.title}
                            </a>
                          </div>
                          <div className='text-[12px] text-gray-400 line-clamp-1'>
                            {page.url}
                          </div>
                          {page.meta.desc && <div>{page.meta.desc}</div>}
                        </div>
                      ))}
                      <div
                        role='button'
                        className='absolute bottom-6 bg-blue-500 h-[44px] rounded-full w-[60%] flex items-center justify-center text-white text-lg font-bold shadow-md'
                        onClick={onGenerateNote}
                      >
                        Generate Note
                      </div>
                    </div>
                  </>
                )}
                {currentNode?.status === 'generating' && (
                  <>
                    <div>{`正在生成：「${currentNode?.keyword}」...`}</div>
                    <Loading />
                  </>
                )}
                {currentNode?.status === 'done' && (
                  <>
                    <div>{`「${currentNode?.keyword}」`}</div>
                    <Markdown>{currentNode.note}</Markdown>
                  </>
                )}
              </div>
              <div className='right-bar w-[64px] flex flex-col h-full border-l-[1px]'>
                <div className='flex justify-end pr-2'>
                  <Cross1Icon
                    className='cursor-pointer'
                    onClick={() => setShowMain(false)}
                  />
                </div>
                <div className='flex flex-col justify-between h-full items-center py-2'>
                  <div className='mt-[20px]'>
                    <ArchiveIcon className='cursor-pointer w-[22px] h-[22px] text-slate-700 hover:text-black' />
                  </div>
                  <div>
                    <GearIcon className='cursor-pointer w-[22px] h-[22px] text-slate-700 hover:text-black' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
