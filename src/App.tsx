import './App.css';

function App() {
  const onCleanStorage = () => {
    chrome.storage.sync.clear()
  }

  return (
    <>
      <div>
        <div onClick={onCleanStorage}>Clean Storage</div>
      </div>
    </>
  )
}

export default App
