import {
  get,
  save,
} from '@/lib/storage';

interface PageMeta {
  title: string
  icon?: string
}

export interface SearchQueueNode {
  keyword: string
  pages: {
    url: string
    status: 'pending' | 'done' | 'error'
    allTexts?: string
    content?: string
    meta: PageMeta
  }[]
}

export enum CoreEvent {
  StartNote = 'start-note',
  NewPageVisite = 'new-page-visite',
}

class Core {
  private _searchQueue?: SearchQueueNode[] = undefined
  private async lazySearchQueue() {
    if (!this._searchQueue) {
      this._searchQueue = (await get<SearchQueueNode[]>('searchQueue')) || []
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
        this.listeners[CoreEvent.NewPageVisite] &&
          this.listeners[CoreEvent.NewPageVisite](
            this._searchQueue && this._searchQueue[this._searchQueue.length - 1]
          )
      }
    })
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

  private async startSearch(keyword: string) {
    const lastSearchQueue = (await this.lazySearchQueue())[
      (await this.lazySearchQueue()).length - 1
    ]

    if (lastSearchQueue?.keyword === keyword) {
      return
    }

    ;(await this.lazySearchQueue()).push({ keyword, pages: [] })
    this.listeners[CoreEvent.StartNote] && this.listeners[CoreEvent.StartNote]()
    await save('searchQueue', await this.lazySearchQueue())
    this.processQueue((await this.lazySearchQueue()).length - 2)
  }

  private async readPage(url: string, meta: PageMeta) {
    const lastSearchQueue = (await this.lazySearchQueue())[
      (await this.lazySearchQueue()).length - 1
    ]
    if (lastSearchQueue?.pages?.some((page) => page.url === url)) {
      return
    }
    lastSearchQueue?.pages?.push({ url, status: 'pending', meta })
    await save('searchQueue', await this.lazySearchQueue())
    console.log(
      'after read page: ',
      await this.lazySearchQueue(),
      lastSearchQueue
    )
  }

  private async processQueue(index: number) {
    const node = (await this.lazySearchQueue())[index]
    if (!node) {
      return
    }

    console.log(
      `你将扮演一位专业的内容摘要专家，你将专注于提取网页中的关键信息，并以简洁、准确的方式进行总结。
      
用户正在搜索：「${
        node.keyword
      }」, 下面这些是用户根据搜索结果点击的页面：${node.pages
        .map((page) => page.url)
        .join(',\n ')}
帮我结合搜索关键词和这些页面的内容总结一下本次搜索的结果`
    )
  }
}

export default new Core()
