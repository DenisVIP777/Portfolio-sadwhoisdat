const logos = document.querySelector('.logos');
    
const helper = document.querySelector('.help');

if (logos) {
  logos.addEventListener('mousemove', function(event) {
    const rect = event.target.getBoundingClientRect();
    const coordsX = rect.left;
    const coordsY = rect.top;

    const myTitle = event.target.getAttribute('my-title');

    if (helper) {
      helper.classList.add('active');
      helper.textContent = myTitle;
      helper.style.transform = `translate(${coordsX}px, ${coordsY}px)`;

      if (myTitle == null) {
        helper.classList.remove('active');
      }
    }
  });
  logos.addEventListener('mouseleave', function(event) {
    if (helper) {
      helper.classList.remove('active');
    }
  });
}



const buttonOpen = document.querySelector('.about-content__button-open');
const buttonOpenFromTopBar = document.querySelector('.top-bar__container-button-about');
const buttonClose = document.querySelector('.about-content__button-close');
const aboutBody = document.querySelector('.about-content__body');
if (buttonOpen) {
	buttonOpen.addEventListener("click", function(e) {
		document.body.classList.add('_lock');
		buttonOpen.classList.add('_active');
		aboutBody.classList.add('_active');
	});
}
if (buttonOpenFromTopBar) {
	buttonOpenFromTopBar.addEventListener("click", function(e) {
		document.body.classList.add('_lock');
		buttonOpenFromTopBar.classList.add('_active');
		aboutBody.classList.add('_active');
	});
}
if (buttonClose) {
	buttonClose.addEventListener("click", function(e) {
		document.body.classList.remove('_lock');
		buttonOpen.classList.remove('_active');
		aboutBody.classList.remove('_active');
	});
}



/**
 * @typedef {Object} dNode
 * @property {HTMLElement} parent
 * @property {HTMLElement} element
 * @property {HTMLElement} to
 * @property {string} breakpoint
 * @property {string} order
 * @property {number} index
 */

/**
 * @typedef {Object} dMediaQuery
 * @property {string} query
 * @property {number} breakpoint
 */

/**
 * @param {'min' | 'max'} type
 */
function useDynamicAdapt(type = 'max') {
    const className = '_dynamic_adapt_'
    const attrName = 'data-da'
  
    /** @type {dNode[]} */
    const dNodes = getDNodes()
  
    /** @type {dMediaQuery[]} */
    const dMediaQueries = getDMediaQueries(dNodes)
  
    dMediaQueries.forEach((dMediaQuery) => {
      const matchMedia = window.matchMedia(dMediaQuery.query)
      // массив объектов с подходящим брейкпоинтом
      const filteredDNodes = dNodes.filter(({ breakpoint }) => breakpoint === dMediaQuery.breakpoint)
      const mediaHandler = getMediaHandler(matchMedia, filteredDNodes)
      matchMedia.addEventListener('change', mediaHandler)
  
      mediaHandler()
    })
  
    function getDNodes() {
      const result = []
      const elements = [...document.querySelectorAll(`[${attrName}]`)]
  
      elements.forEach((element) => {
        const attr = element.getAttribute(attrName)
        const [toSelector, breakpoint, order] = attr.split(',').map((val) => val.trim())
  
        const to = document.querySelector(toSelector)
  
        if (to) {
          result.push({
            parent: element.parentElement,
            element,
            to,
            breakpoint: breakpoint ?? '767',
            order: order !== undefined ? (isNumber(order) ? Number(order) : order) : 'last',
            index: -1,
          })
        }
      })
  
      return sortDNodes(result)
    }
  
    /**
     * @param {dNode} items
     * @returns {dMediaQuery[]}
     */
    function getDMediaQueries(items) {
      const uniqItems = [...new Set(items.map(({ breakpoint }) => `(${type}-width: ${breakpoint}px),${breakpoint}`))]
  
      return uniqItems.map((item) => {
        const [query, breakpoint] = item.split(',')
  
        return { query, breakpoint }
      })
    }
  
    /**
     * @param {MediaQueryList} matchMedia
     * @param {dNodes} items
     */
    function getMediaHandler(matchMedia, items) {
      return function mediaHandler() {
        if (matchMedia.matches) {
          items.forEach((item) => {
            moveTo(item)
          })
  
          items.reverse()
        } else {
          items.forEach((item) => {
            if (item.element.classList.contains(className)) {
              moveBack(item)
            }
          })
  
          items.reverse()
        }
      }
    }
  
    /**
     * @param {dNode} dNode
     */
    function moveTo(dNode) {
      const { to, element, order } = dNode
      dNode.index = getIndexInParent(dNode.element, dNode.element.parentElement)
      element.classList.add(className)
  
      if (order === 'last' || order >= to.children.length) {
        to.append(element)
  
        return
      }
  
      if (order === 'first') {
        to.prepend(element)
  
        return
      }
  
      to.children[order].before(element)
    }
  
    /**
     * @param {dNode} dNode
     */
    function moveBack(dNode) {
      const { parent, element, index } = dNode
      element.classList.remove(className)
  
      if (index >= 0 && parent.children[index]) {
        parent.children[index].before(element)
      } else {
        parent.append(element)
      }
    }
  
    /**
     * @param {HTMLElement} element
     * @param {HTMLElement} parent
     */
    function getIndexInParent(element, parent) {
      return [...parent.children].indexOf(element)
    }
  
    /**
     * Функция сортировки массива по breakpoint и order
     * по возрастанию для type = min
     * по убыванию для type = max
     *
     * @param {dNode[]} items
     */
    function sortDNodes(items) {
      const isMin = type === 'min' ? 1 : 0
  
      return [...items].sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.order === b.order) {
            return 0
          }
  
          if (a.order === 'first' || b.order === 'last') {
            return -1 * isMin
          }
  
          if (a.order === 'last' || b.order === 'first') {
            return 1 * isMin
          }
  
          return 0
        }
  
        return (a.breakpoint - b.breakpoint) * isMin
      })
    }
  
    function isNumber(value) {
      return !isNaN(value)
    }
  }
  
useDynamicAdapt();



const awardsList = document.querySelector('.awards__list');
const awardsButton = document.querySelector('.awards__button');

if (awardsButton) {
  awardsButton.addEventListener('click', function(event) {
    awardsButton.classList.toggle('open');
    if (awardsList) {
      awardsList.classList.toggle('_active');
    }
  });
}

const aboutButtonShowContent = document.querySelector('.about-content__button-show-content');
const aboutText = document.querySelector('.about-content__text');

if (aboutButtonShowContent) {
  aboutButtonShowContent.addEventListener('click', function(event) {
    aboutButtonShowContent.classList.toggle('open');
    if (aboutText) {
      aboutText.classList.toggle('_active');
    }
  });
}

/*top bar script start*/
/*Высчитываю сколько я проскроллил конкретный элемент в px*/
var block = document.querySelector('.main-content__container');

if (block) {
  block.addEventListener("scroll", function (e) {
    const lastKnownScrollPosition = block.scrollTop;
  
    const topBar = document.querySelector('.top-bar');
  
    if(lastKnownScrollPosition > 200){
      topBar.classList.add('_active');
    } else {
      topBar.classList.remove('_active');
    }
  });
}





/*audio script start*/

const audio = document.getElementById("audio-player");

if (audio) {
  // style range volume
  const volumeSlider = document.querySelector('.volume-slider input');
  volumeSlider.addEventListener('input', function() {
    var x = volumeSlider.value;

    volumeSlider.style.background = `linear-gradient(90deg, #17D41F ${x}%, rgba(252, 251, 253, 0.14) ${x}% )`;

    if (volumeSlider.value <= 0) {
      document.querySelector('.volume-slider').classList.add('volume-off');
    } else {
      document.querySelector('.volume-slider').classList.remove('volume-off');
    }
  });



  // state

  const state = { activeTrack: 0, initPlay: false };

  // selectors

  const ui = {
      // sliders
      seekBar: document.querySelector('.seek-slider input'),
      volumeBar: document.querySelector('.volume-slider input'),

      // buttons
      prevBtn: document.querySelector('.prev'),
      nextBtn: document.querySelector('.next'),
      playPauseBtn: document.querySelector('.play-pause'),

      // text and image
      artwork: document.querySelector('.artwork'),
      trackName: document.querySelector('.name'),
      artist: document.querySelector('.artist'),
      currentTime: document.querySelector('.current-time'),
      duration: document.querySelector('.duration'),
  }

  // event listeners

  const setupEventListeners = () => {
      document.addEventListener('DOMContentLoaded', loadTrack);

      //player events
      ui.playPauseBtn.addEventListener('click', playPauseTrack);
      ui.seekBar.addEventListener('input', updateSeek);
      ui.volumeBar.addEventListener('input', updateVolume);
      ui.nextBtn.addEventListener('click', nextTrack);
      ui.prevBtn.addEventListener('click', prevTrack);


      // audio events
      audio.addEventListener('ended', nextTrack);
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener("loadedmetadata", updateTrackInfo);
      audio.addEventListener('durationchange', updateDuration);
  };

  // event handlers

  ui.seekBar.addEventListener('input', function() {
    audio.volume = 0;
  });
  ui.seekBar.addEventListener('change', function() {
    audio.volume = ui.volumeBar.value / 100;
  });

  audio.volume = ui.volumeBar.value / 100;
  const updateVolume = () => {
      audio.volume = ui.volumeBar.value / 100;
  }

  const updateSeek = () => {
      audio.currentTime = ui.seekBar.value / 100 * audio.duration;
  }


  const updateTime = () => {
      ui.seekBar.value = audio.currentTime / audio.duration * 100;
      ui.currentTime.textContent = formatTime(audio.currentTime);

      // just style range seekBar
      ui.seekBar.style.background = `linear-gradient(90deg, #FCFBFD ${audio.currentTime / audio.duration * 100}%, rgba(252, 251, 253, 0.14) ${audio.currentTime / audio.duration * 100}% )`;
  }

  const updateDuration = () => {
      ui.seekBar.value = 0;
      ui.duration.textContent = formatTime(audio.duration);
  }

  const updateTrackInfo = () => {
      ui.artwork.src = tracks[state.activeTrack].artwork;
      ui.trackName.textContent = tracks[state.activeTrack].name;
      ui.artist.textContent = tracks[state.activeTrack].artist;
  }

  const playPauseTrack = () => {
      audio.paused ? audio.play() : audio.pause();
      ui.playPauseBtn.classList.toggle("paused", audio.paused);
      if(!state.initPlay) state.initPlay = true;
  }

  const prevTrack = () => {
      state.activeTrack = (state.activeTrack - 1 + tracks.length) % tracks.length;
      loadTrack();
  }

  const nextTrack = () => {
      state.activeTrack = (state.activeTrack + 1) % tracks.length;
      loadTrack();
  }

  const loadTrack = () => {
      audio.src = tracks[state.activeTrack].path;
      state.initPlay && playPauseTrack();
  };

  const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);

      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  setupEventListeners();
}
/*audio script end*/


/*preloader script start*/
var 
  images = document.querySelectorAll('img'),
  imagesTotalCount = images.length,
  imagesLoadedCount = 0,
  preloader = document.getElementById('preloader'),
  loader = document.querySelector('.loader'),
  percDisplay = document.getElementById('load-perc');

for ( var i = 0; i < imagesTotalCount; i++ ) {
  imageClone = new Image();
  imageClone.onload = imageLoaded;
  imageClone.onerror = imageLoaded;
  imageClone.src = images[i].src;
}

function imageLoaded() {
  imagesLoadedCount++;

  percDisplay.textContent = ( ( (100 / imagesTotalCount) * imagesLoadedCount ) << 0);
  loader.style.background = `linear-gradient(90deg, #100E18 ${( ( (100 / imagesTotalCount) * imagesLoadedCount ) << 0)}%, #714cf4 ${( ( (100 / imagesTotalCount) * imagesLoadedCount ) << 0)}%)`;
  percDisplay.style.background = `linear-gradient(90deg, #714cf4 ${( ( (100 / imagesTotalCount) * imagesLoadedCount ) << 0)}%, #100E18 ${( ( (100 / imagesTotalCount) * imagesLoadedCount ) << 0)}%)`;


  if ( imagesLoadedCount >= imagesTotalCount ) {
    setTimeout(function() {
      if ( !preloader.classList.contains('done') ) {
        preloader.classList.add('done');
      }
  
    }, 1000);
  }
}
/*preloader script end*/


/*open-info-case*/
const buttonOpenVideoInfo = document.querySelector('.button-open-video-panel');
const buttonCloseVideoInfo = document.querySelector('.video-content__button-close');
const videoInfo = document.querySelector('.video-content__body');
if (buttonOpenVideoInfo) {
	buttonOpenVideoInfo.addEventListener("click", function(e) {
		document.body.classList.add('_lock');
		buttonOpenVideoInfo.classList.add('_active');
		videoInfo.classList.add('_active');
	});
}
if (buttonCloseVideoInfo) {
	buttonCloseVideoInfo.addEventListener("click", function(e) {
		document.body.classList.remove('_lock');
		buttonOpenVideoInfo.classList.remove('_active');
		videoInfo.classList.remove('_active');
	});
}