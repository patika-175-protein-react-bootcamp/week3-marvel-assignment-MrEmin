import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [list, setList] = useState(1);
  const [item, setItem] = useState({
    hero: Array(20).fill({}),
  });
  const[loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState([]);
  const skip = 4;

  useEffect(() => {
    window.addEventListener('hashchange', hashHandler);
    return () => window.addEventListener('hashchange', hashHandler);
  }, []);

  useEffect(() => {
    getData();
    newPagination(list);
  }, [list, item.limit]);

  const getData = () => {
    const storageItems = JSON.parse(sessionStorage.getItem('info')) || {};
    const limit = JSON.parse(sessionStorage.getItem('limit')) || 0;
    setLoading(true);

    if (!storageItems[list]) {
      axios
        .get(
          `https://gateway.marvel.com:443/v1/public/characters?apikey=cd0315a7c15630a5bdb89fafa5ed0f1a&offset=${(list - 1) * 20 }&limit=20`
        )
        .then((res) => {
          storageItems[list] = [...res.data.data.results];
          sessionStorage.setItem('info',JSON.stringify(storageItems));
          sessionStorage.setItem('limit',JSON.stringify(res.data.data.total / 20));
          setItem({hero: res.data.data.results, limit: res.data.data.total / 20});
          setLoading(false);
        });
    } else {
      setItem({ hero: storageItems[list], limit });
      setLoading(false);
    }
  };

  const newPagination = (list) => {
    const listArray = [];
    if (list <= skip) {
      for (let i = 1; i < skip + 1; i++) {
        listArray.push(i);
      }
      if (!listArray.includes(list + 1)) {
        listArray.push(list + 1);
      }
      listArray.push('dots');
      listArray.push(item.limit);
      listArray.push('RightArrow');
    } else if (skip < list && list <= item.limit - skip) {
      listArray.push('LeftArrow');
      listArray.push(1);
      listArray.push('dots');
      for (let i = list - 1; i <= list + 1; i++) {
        listArray.push(i);
      }
      listArray.push('dots');
      listArray.push(item.limit);
      listArray.push('RightArrow');
    } else {
      listArray.push('LeftArrow');
      listArray.push(1);
      listArray.push('dots');
      if (list === item.limit - 3) {
        listArray.push(item.limit - 4);
      }
      for (let i = item.limit - 3; i <= item.limit; i++) {
        listArray.push(i);
      }
    }
    setPagination([...listArray]);
  };

  const hashHandler = () => {
    setList(parseInt(window.location.hash.substring(1)));
  };

  const newPaginationJS = useCallback(
    (paginationElement, index) => {
      switch (paginationElement) {
      case 'LeftArrow':
        return (
          <span
            key={'left'}
            className="pagination"
            onClick={() => changelist(list - skip)}
          >
            <img src={'../img/leftArrow.png'} alt="leftArrow" className='leftArrow' />
          </span>
        );

      case 'RightArrow':
        return (
          <span
            key={'right'}
            className="pagination"
            onClick={() => changelist(list + 3)}
          >
            <img src={'../img/rightArrow.png'} alt="rightArrow" className='rightArrow' />
          </span>
        );

      case 'dots':
        return (
          <span key={paginationElement + index}>...</span>
        );

      default:
        return (
          <span key={paginationElement + index}
            onClick={
              paginationElement !== list? () => changelist(paginationElement) : null
            }>
            {paginationElement}
          </span>
        );
      }
    },
    [list]
  );

  const changelist = (mylist = list) => {
    window.location.hash = mylist;
  };

  return (
    <div className="App">
      <header>
        <img className="background" src={'../img/background.png'} alt="background" />
        <img className="img-logo" src={'../img/logo.png'} alt="Marvel" />
      </header>
      <div className='container'>
        <div className='cards'>
          {item?.hero?.map((item, index) => (
            <div className='card' key={item?.id ? item.id : index}>
              <div className="img-container">
                <img src={
                  !loading
                    ? item.thumbnail?.path +'/portrait_xlarge.' +item.thumbnail?.extension : null} />
              </div>
              <div className="text-container">
                <h3>{!loading ? item.name : 'Loading...'}</h3>
              </div>
            </div>
          ))}
        </div>
        <footer>
          <div className='pagination'>
            {item?.hero && pagination?.map((item, index) => newPaginationJS(item, index))}
          </div>
        </footer>
      </div>
      {
        loading && <div className='loading'><span>Loading</span></div>
      }
    </div>
  );
}

export default App;
