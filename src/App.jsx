import { useMemo, useState, useEffect, useRef } from 'react'
import { strongs, strongsList} from './hebrew/hebDict'

// This is a component that contains all of the words that are either searched for or there by default
const WordList = ({ data, openFunction }) => {
  const elements = useMemo(() => {
    return data.map((word) =>(
      <div key={word.id} id={word.id} className="word-container" onClick={(e)=>{openFunction(word)}}>
        <div className='word-header'>
          <div className='strong-id'>
            <p>{word.id}</p>
            <p>{word.kjv_def?word.kjv_def.replace('[phrase] ','').replace('(This',',').replace('(only',',').replace('Compare',',').split(",")[0].replace('.',''):word.strongs_def}</p>
          </div>
          <div className='hebrew'>
            <p className='hebrew'>{word.lemma}</p>
            <p>({word.pron})</p>
          </div>
        </div>
      </div>
  ));
  }, [data]);
  return <div id="word-list">{elements}</div>;
}

//This is the main component
function App() {
  // Set up state variables
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentList, setCurrentList] = useState(strongsList)
  const [allWords, setAllWords] = useState([]);
  const [visibleWords,setVisibleWords] = useState([]);
  const [currentWordList,setCurrentWordList] = useState();
  const [wordsPerPage,setWordsPerPage] = useState(100);
  const [currentWord,setCurrentWord] = useState([])

  //References to different elements
  const root = useRef()
  const infoBox = useRef()
  const wordInfo = useRef()

  //Open up the word card when it is clicked
  function openWordInfo(word){
    setCurrentWord(word)
    infoBox.current.style.display = 'flex';
    infoBox.current.classList.add('open');
    root.current.onscroll = (e)=>{
      e.preventDefault()
    }
  }
  // Close word card
  function closeWordInfo(){
    infoBox.current.classList.remove('open');
  }

  //Search function
  function findWords(substring){
    if(substring == ''){
      return strongsList
    }
    let newList = []
    strongsList.forEach((word,index)=>{
      for(var item in word){
        if(word[item].toLowerCase().includes(substring.toLowerCase()) || word[item].replace(/[\u0591-\u05C7]/g, '').includes(substring.toLowerCase())){
          newList.push(word)
          break;
        }
      }
    })
    if(newList.length == 0){
      newList.push({"lemma":"","id":"No results found.","xlit":"","pron":"","derivation":"","strongs_def":"","kjv_def":""})
    }
    return newList
  }

  //Update the words that are being shown
  function updateWords(words){
    let numPages = Math.ceil(words.length/wordsPerPage)
    let paginatedWords = Array(numPages).fill().map(e => [])
    let fillingPage = 0
    words.forEach((word,index)=>{
      if(index >= wordsPerPage*(fillingPage + 1)){
        fillingPage += 1
      }
      paginatedWords[fillingPage].push(word)
    })
    setAllWords(paginatedWords)
    setTotalPages(numPages)
    setCurrentPage(1);
  }

  //What to do when the search bar is used
  function handleSearch(searchBar){
    setCurrentList(findWords(searchBar.value))
    setSearch(searchBar.value)
  }

  //A few more references to elements
  const backButtonTop = useRef()
  const nextButtonTop = useRef()
  const backButton = useRef()
  const nextButton = useRef()
  
  //The next session contains useEffects to update the page when state changes.
  useEffect(()=>{
    updateWords(currentList)
  },[,currentList,wordsPerPage])

  useEffect(()=>{
    setVisibleWords(allWords[currentPage-1])
  },[allWords])

  useEffect(() => {
    if(visibleWords){
      setCurrentWordList(<WordList data={visibleWords} openFunction={openWordInfo}/>);
    }
  }, [visibleWords]);

  useEffect(()=>{
    if(backButton.current){
      if(currentPage == 1){
        backButton.current.style.visibility = 'hidden';
        backButtonTop.current.style.visibility = 'hidden';
      }
      else{
        backButton.current.style.visibility = 'visible';
        backButtonTop.current.style.visibility = 'visible';
      }
    }
    if(nextButton.current){
      if(currentPage == totalPages){
        nextButton.current.style.visibility = 'hidden';
        nextButtonTop.current.style.visibility = 'hidden';
      }
      else{
        nextButton.current.style.visibility = 'visible';
        nextButtonTop.current.style.visibility = 'visible';
      }
    }
  },[,visibleWords])
    
  useEffect(()=>{
    setVisibleWords(allWords[currentPage-1])
  },[currentPage])

  //This is what is displayed when the App component is used
  return (
    <div ref={root} style={{height:'100vh',width:'100vw',overflow:'auto'}}>
    <div ref={infoBox} onClick={closeWordInfo} className='word-info-container'>
      <div ref={wordInfo} onClick={(e)=>{e.stopPropagation()}} className='word-info'>
      <button className='close-button' onClick={closeWordInfo}>✕</button>
        <div className='word-info-header'> 
          <div className='words'>
            <div className='word-id'>
              {currentWord.id}
              <div className='derivation'>
                {currentWord.derivation}
              </div>
            </div>
            <div className='heb-word'>
              {currentWord.lemma}
              <div className='pronunciation'>
                <p>({currentWord.pron}/{currentWord.xlit})</p>
              </div>
            </div>
          </div>
        </div>
        <div className='info-section'>
          <div className='word-meaning'>
            <div className='strongs-def'>
              <span>Definition:</span> <p>{currentWord.strongs_def}</p>
            </div>
            <div className='kjv-def'>
              <span>Used in KJV for:</span> <p>{currentWord.kjv_def}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id='search-container'>
      <input placeholder='Search' value={search} onChange={(e) => handleSearch(e.target)} id="search" type="text"/>
    </div>
    <nav>
      <button ref={backButtonTop} onClick={()=>{setCurrentPage(currentPage-1)}}>Back</button>
      <p>page {currentPage}/{totalPages}</p>
      <button ref={nextButtonTop} onClick={()=>{setCurrentPage(currentPage+1)}}>Next</button>
    </nav>
    {currentWordList}
    <nav>
      <button ref={backButton} onClick={()=>{setCurrentPage(currentPage-1)}}>Back</button>
      <p>page {currentPage}/{totalPages}</p>
      <button ref={nextButton} onClick={()=>{setCurrentPage(currentPage+1)}}>Next</button>
    </nav>
    </div>
  )
}

export default App
