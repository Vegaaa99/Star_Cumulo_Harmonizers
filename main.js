window.addEventListener('load', function () {
  const avatarImg = document.querySelector('.avatar-img');
  const sentContainer = document.querySelector('.sent-container');
  const speakerEl = document.createElement('img');
  const randomWordsField = document.querySelector('.random-words-field');
  const answerField = document.querySelector('.answer-field');
  const footer = document.querySelector('.footer');
  const continueButton = document.querySelector('.continue-button');
  const continueButtonFail = document.querySelector('.continue-button-fail');

  const progress = document.querySelector('.progress');

  const winFooter = document.querySelector('.win-footer');
  winFooter.style.display = 'none';
  const loseFooter = document.querySelector('.lose-footer');
  loseFooter.style.display = 'none';

  let checkButton = document.querySelector('.check-button');
  checkButton.disabled = true;

  if (checkButton.disabled) {
    checkButton.classList.add('disabledCheckButton');
  }

  speakerEl.setAttribute('id', 'speaker');
  speakerEl.src = './assets/speaker.svg';


  const tts = window.speechSynthesis;
  let incr = 0;
  let randomWordsArr = [];
  let randomWordsArrDom = [];
  let answerFieldWordsArr = [];
  let answerArr = [];
  let progressStart = 0;
  const progressRange = 100 / data.length;
  const widthHeightArr = [];
  let index = 0;
  let sound = null;
  //let answerWordsArrIsFull = false;

  // console.log('random words arr', randomWordsArr)



  const randomWordsCreator = () => {
    data.map((obj) => {
      splittedStr = obj.engPhrase.split(" ");
      copy_array = randomWordsArr;
      return randomWordsArr.push(...splittedStr);
    });

    shuffle(randomWordsArr).map((randWord) => {
      //placeholder
      const parent_button = document.createElement('div');
      parent_button.className = 'placeholder';
      parent_button.id = index;


      //random word
      randomWordsField.appendChild(parent_button);
      const button_element = document.createElement('button');

      button_element.textContent = randWord;
      button_element.className = 'word';
      button_element.id = index;
      button_element.setAttribute('value', randWord);

      var current_placeholder = document.getElementById(index);
      current_placeholder.appendChild(button_element);

      //setting height and width of parent element equal to child element
      var childHeight = button_element.offsetHeight * 1.5;
      var childWidth = button_element.offsetWidth * 1.5;
      parent_button.style.height = childHeight + "px";
      parent_button.style.width = childWidth + "px";
      widthHeightArr[index] = [childHeight, childWidth];
      index++;
    });

    randomWordsArrDom.forEach(w => {
      randomWordsField.appendChild(w);
    });
  };

  randomWordsCreator();

  //console.log(randomWordsArr,randomWordsArrDom,answerFieldWordsArr);

  //function to push target into answer and changing eventlistner
  function pushIntoAnswer(e) {
    index = e.target.id;
    //console.log(e.target);
    answerFieldWordsArr.push(e.target);
    if (answerFieldWordsArr.length > 0) {
      checkButton.disabled = false;
      checkButton.classList.remove('disabledCheckButton');
      checkButton.classList.add('enabled-check-button');
    }
    answerField.appendChild(e.target);
    randomWordsArr[index] = "";
    //console.log(e.target);
    e.target.removeEventListener('click', pushIntoAnswer);
    e.target.classList.remove('word');
    e.target.classList.add('added');
    e.target.style.height = widthHeightArr[index][0] + 'px';
    e.target.style.width = widthHeightArr[index][1] + 'px';
    e.target.addEventListener('click', removingElement);
  }

  //function to push answer into random array and changing eventlistner
  function removingElement(e) {
    let index = e.target.id;
    let parentDiv = randomWordsField.children[index];
    parentDiv.appendChild(e.target);
    randomWordsArr[index] = e.target.value;
    answerFieldWordsArr.pop();
    if (answerFieldWordsArr.length <= 0) {
      checkButton.disabled = true;
      checkButton.classList.add('disabledCheckButton');
      checkButton.classList.remove('enabled-check-button');
    }

    e.target.removeEventListener('click', removingElement);
    e.target.classList.add('word');
    e.target.classList.remove('added');
    e.target.style.height = widthHeightArr[index][0] - 3 + 'px';
    e.target.style.width = widthHeightArr[index][1] - 3 + 'px';
    e.target.addEventListener('click', pushIntoAnswer);
  }

  //map random array and add eventlister
  let arr = Array.from(randomWordsField.children);
  let childArr = arr.map((arr) => arr.children[0]);
  childArr.forEach(w => {
    w.addEventListener('click', pushIntoAnswer);
  });

  //map answer array and add eventlistener
  answerFieldWordsArr = Array.from(answerField.children);
  answerFieldWordsArr.map(w => {
    w.addEventListener('click', removingElement);
  });

  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  const resetQuestion = () => {
    sentContainer.innerHTML = '';
  };

  const iterateEachWord = (i) => {
    const questions = [...data];
    //console.log(questions[i])
    avatarImg.src = questions[i].pic;
    sentContainer.appendChild(speakerEl);
    questions[i].phraseByWord.map((word) => {
      let wordEl = document.createElement('button');
      wordEl.innerText = word.word;
      wordEl.setAttribute('class', 'word-item');
      if (word.highlighted) {
        wordEl.setAttribute('class', 'word-item highlighted');
      }

    });
  };

  iterateEachWord(incr);

  // Check answers 
  const checkAnswer = () => {
    //console.log(answerArr);
    answerFieldWordsArr.forEach((item) => {
      let val = item.value;
      answerArr.push(val);
    });
    let ansStr = answerArr.join(' ');
    if (ansStr === data[incr].engPhrase) {
      //console.log('correct');
      sound = new Audio('https://res.cloudinary.com/nzmai/video/upload/v1605697967/lvlupsound_n13hts.mp3');
      sound.play();
      progressStart += progressRange;
      footer.style.display = 'none';
      winFooter.style.display = 'flex';
      progress.style.width = progressStart + '%';
    } else {
      //console.log('false');
      sound = new Audio('https://res.cloudinary.com/nzmai/video/upload/v1605698209/errorsound_jxtmqg.mp3');
      sound.play();
      footer.style.display = 'none';
      loseFooter.style.display = 'flex';
    }
  };

  // attach event listener to check button
  checkButton.addEventListener('click', checkAnswer);

  const getNewQuestion = (i) => {
    const questions = [...data];
    //console.log(questions[i])
    avatarImg.src = questions[i].pic;
    resetQuestion();
    iterateEachWord(i);
    const wordItems = document.querySelectorAll('.word-item');
    wordItems.forEach(wordItem => wordItem.addEventListener('mouseover', (e) => {
      speak(e.target.value, 'fr-FR');
    }));
  };

  getNewQuestion(incr);

  const speak = (phrase, lang) => {
    let toSpeak = new SpeechSynthesisUtterance(phrase);
    toSpeak.lang = lang;
    tts.speak(toSpeak);
  };

  speakerEl.addEventListener('click', () => {
    speak(data[incr].frPhrase, 'fr-FR');
  });

  //console.log(wordItems)

  continueButton.addEventListener('click', () => {
    incr += 1;
    index = 0;
    getNewQuestion(incr);
    answerArr = [];
    answerFieldWordsArr = [];
    answerField.innerHTML = '';
    winFooter.style.display = 'none';
    footer.style.display = 'flex';
    checkButton.classList.add('disabledCheckButton');
    checkButton.classList.remove('enabled-check-button');
  });

  continueButtonFail.addEventListener('click', () => {
    incr += 1;
    index = 0;
    getNewQuestion(incr);
    answerArr = [];
    answerFieldWordsArr = [];
    answerField.innerHTML = '';
    loseFooter.style.display = 'none';
    footer.style.display = 'flex';
    checkButton.classList.add('disabledCheckButton');
    checkButton.classList.remove('enabled-check-button');
  });

  /* window.addEventListener('keydown', (key) => {
    if (key.keyCode == "39") {
      incr += 1;
      getNewQuestion(incr);
    }
    if (key.keyCode == "37") {
      incr -= 1;
      getNewQuestion(incr);
    }
  }); */
});
