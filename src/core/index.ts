export interface SearchQueueNode {
  keyword: string
  pages: {
    url: string
    status: 'pending' | 'done' | 'error'
    allTexts?: string
    content?: string
  }[]
}

export enum CoreEvent {
  StartNote = 'start-note',
  NewPageVisite = 'new-page-visite',
}

class Core {
  private searchQueue: SearchQueueNode[] = []

  private listeners: { [key: string]: (data?: any) => void } = {}

  subscript<T>(event: CoreEvent, callback: (data?: T) => void) {
    this.listeners[event] = callback
  }

  visitepage(url: string) {
    const _url = new URL(url)
    const searchParams = _url.searchParams
    const keyword = searchParams.get('q') || searchParams.get('wd')

    if (
      keyword &&
      (_url.hostname.endsWith('baidu.com') ||
        _url.hostname.endsWith('google.com'))
    ) {
      this.startSearch(keyword!)
    } else {
      this.readPage(url)
    }
    this.listeners[CoreEvent.NewPageVisite] &&
      this.listeners[CoreEvent.NewPageVisite](this.current())
  }

  current() {
    return this.searchQueue[this.searchQueue.length - 1]
  }

  private startSearch(keyword: string) {
    this.searchQueue.push({ keyword, pages: [] })
    this.listeners[CoreEvent.StartNote] && this.listeners[CoreEvent.StartNote]()
    this.processQueue(this.searchQueue.length - 2)
  }

  private readPage(url: string) {
    const lastSearchQueue = this.searchQueue[this.searchQueue.length - 1]
    if (lastSearchQueue?.pages?.some((page) => page.url === url)) {
      return
    }
    lastSearchQueue?.pages?.push({ url, status: 'pending' })
  }

  private processQueue(index: number) {
    const node = this.searchQueue[index]
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
