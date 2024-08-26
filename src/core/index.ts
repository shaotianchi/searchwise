import OpenAI from 'openai'

import { get, insert, save, StorageKeys } from '@/lib/storage'

interface PageMeta {
  title: string
  icon?: string
}

export interface SearchQueueNode {
  keyword: string
  status: 'pending' | 'generating' | 'done' | 'error'
  pages: {
    url: string
    allTexts?: string
    content?: string
    meta: PageMeta
  }[]
  note?: string | null
}

const client = new OpenAI({
  apiKey: 'sk-9f8cwrdcR7HyQsLGO2BJw2LiHh4T7nf1ybvD5yqS7PZpPSfy',
  baseURL: 'https://api.moonshot.cn/v1',
  dangerouslyAllowBrowser: true,
})

export enum CoreEvent {
  StartNote = 'start-note',
  NewPageVisite = 'new-page-visite',
  BeginGenerate = 'begin-generate',
  GenerateResult = 'generate-result',
}

class Core {
  private _searchQueue?: SearchQueueNode[] = undefined
  private async lazySearchQueue() {
    if (!this._searchQueue) {
      this._searchQueue =
        (await get<SearchQueueNode[]>(StorageKeys.SearchQueue)) || []
      this.listeners[CoreEvent.NewPageVisite] &&
        this.listeners[CoreEvent.NewPageVisite](
          this._searchQueue[this._searchQueue.length - 1]
        )
    }
    return this._searchQueue
  }

  private listeners: { [key: string]: (data?: any) => void } = {}

  constructor() {
    chrome.storage.sync.onChanged.addListener((changes) => {
      console.log('change is ', changes)
      if (changes.searchQueue) {
        this._searchQueue = changes.searchQueue.newValue
        this.message(
          CoreEvent.NewPageVisite,
          this._searchQueue && this._searchQueue[this._searchQueue.length - 1]
        )
      }
    })
  }

  private message<T>(type: CoreEvent, data?: T) {
    this.listeners[type] && this.listeners[type](data)
  }

  subscript<T>(event: CoreEvent, callback: (data?: T) => void) {
    this.listeners[event] = callback
  }

  async visitpage(url: string, meta: PageMeta) {
    console.log('visit page: ', url, meta)
    const _url = new URL(url)
    const searchParams = _url.searchParams
    const keyword = searchParams.get('q') || searchParams.get('wd')

    if (
      keyword &&
      (_url.hostname.endsWith('baidu.com') ||
        _url.hostname.endsWith('google.com'))
    ) {
      await this.startSearch(keyword!)
    } else {
      await this.readPage(url, meta)
    }
  }

  async current() {
    return (await this.lazySearchQueue())[
      (await this.lazySearchQueue()).length - 1
    ]
  }

  async generateCurrent() {
    const currentNode = (await this.lazySearchQueue())[
      (await this.lazySearchQueue()).length - 1
    ]
    currentNode.status = 'generating'
    this.message(CoreEvent.BeginGenerate, currentNode)
    const result = await this.processQueue(
      (await this.lazySearchQueue()).length - 1
    )

    currentNode.status = 'done'
    currentNode.note = result
    this.message(CoreEvent.GenerateResult, currentNode)
    await insert(StorageKeys.SearchNotes, currentNode)
    // await save('searchQueue', await this.lazySearchQueue())
  }

  private async startSearch(keyword: string) {
    const lastSearchQueue = (await this.lazySearchQueue())[
      (await this.lazySearchQueue()).length - 1
    ]

    if (lastSearchQueue?.keyword === keyword) {
      return
    }

    const nodes = await this.lazySearchQueue()
    nodes.push({
      keyword,
      pages: [],
      status: 'pending',
    })
    this.message(CoreEvent.StartNote)
    await save(StorageKeys.SearchQueue, await this.lazySearchQueue())
    this.processQueue((await this.lazySearchQueue()).length - 2)
  }

  private async readPage(url: string, meta: PageMeta) {
    const lastSearchQueue = (await this.lazySearchQueue())[
      (await this.lazySearchQueue()).length - 1
    ]
    if (lastSearchQueue?.pages?.find((page) => page.url === url)) {
      return
    }
    console.log('reading: ', await this.lazySearchQueue(), lastSearchQueue)
    lastSearchQueue?.pages?.push({ url, meta })
    await save(StorageKeys.SearchQueue, await this.lazySearchQueue())
    console.log(
      'after read page: ',
      await this.lazySearchQueue(),
      lastSearchQueue,
      await get(StorageKeys.SearchQueue)
    )
  }

  private async processQueue(index: number) {
    const node = (await this.lazySearchQueue())[index]
    if (!node) {
      return
    }

    const completion = await client.chat.completions.create({
      model: 'moonshot-v1-8k',
      messages: [
        {
          role: 'system',
          content:
            '你将扮演一位专业的内容摘要专家，你将专注于提取网页中的关键信息，并以简洁、准确的方式进行总结。',
        },
        {
          role: 'user',
          content: `用户正在搜索：「${node.keyword}」
这些是用户根据搜索结果点击的页面：${node.pages
            .map((page) => page.url)
            .join(',\n ')}
帮我结合搜索关键词和这些页面的内容总结一下本次搜索的结果`,
        },
      ],
      temperature: 0.3,
    })

    console.log(completion.choices[0].message.content)
    console.log(
      `你将扮演一位专业的内容摘要专家，你将专注于提取网页中的关键信息，并以简洁、准确的方式进行总结。
      
用户正在搜索：「${
        node.keyword
      }」, 下面这些是用户根据搜索结果点击的页面：${node.pages
        .map((page) => page.url)
        .join(',\n ')}
帮我结合搜索关键词和这些页面的内容总结一下本次搜索的结果`
    )
    return completion.choices[0].message.content
  }
}

export default new Core()
