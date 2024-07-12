chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    console.log('searchwise install')
  }
})

chrome.tabs.onCreated.addListener(function (tab) {
  console.log('Tab opened with ID:', tab.id, tab.url, tab.title)
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log(
    'Tab update with ID:',
    tabId,
    changeInfo,
    tab.id,
    tab.url,
    tab.title
  )

  // if (changeInfo.status !== 'complete') {
  //   return
  // }
  // const url = new URL(tab.url!)
  // const searchParams = url.searchParams
  // const keyword = searchParams.get('q') || searchParams.get('wd')

  // if (
  //   keyword &&
  //   (url.hostname.endsWith('baidu.com') || url.hostname.endsWith('google.com'))
  // ) {
  //   Core.startSearch(keyword!)
  // } else {
  //   Core.readPage(tab.url!)
  // }
})
