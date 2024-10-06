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
  let answerFieldWordsArr = [];
  let answerArr = [];
  let progressStart = 0;
  const progressRange = 100 / data.length;
  const widthHeightArr = [];
  let index = 0;
  let sound = null;

  const randomWordsCreator = () => {
    randomWordsArr = []; // Clear previous random words
  
    // If it's the first question, use the specified words
    if (incr === 0) { // Check if it's the first question
      const firstQuestionWords = data[0].phraseByWord; // Get words from the first question
      randomWordsArr.push(...firstQuestionWords); // Add these specific words
    } else {
      // For other questions, gather words from the remaining data
      data.forEach((obj) => {
        if (Array.isArray(obj.phraseByWord)) {
          obj.phraseByWord.forEach(item => {
            if (typeof item === 'string') {
              randomWordsArr.push(item);
            } else if (item.word) {
              randomWordsArr.push(item.word);
            }
          });
        } else if (obj.trans && Array.isArray(obj.trans)) {
          randomWordsArr.push(...obj.trans);
        }
      });
    }
  
    // Shuffle the random words array
    shuffle(randomWordsArr).forEach((randWord, index) => {
      const parentDiv = document.createElement('div');
      parentDiv.className = 'placeholder';
      parentDiv.id = index;
  
      const wordButton = document.createElement('button');
      wordButton.textContent = randWord; // Display the shuffled word
      wordButton.className = 'word';
      wordButton.id = index;
      wordButton.setAttribute('value', randWord);
  
      parentDiv.appendChild(wordButton);
      randomWordsField.appendChild(parentDiv);
  
      const childHeight = wordButton.offsetHeight * 1.5;
      const childWidth = wordButton.offsetWidth * 1.5;
      parentDiv.style.height = `${childHeight}px`;
      parentDiv.style.width = `${childWidth}px`;
  
      widthHeightArr[index] = [childHeight, childWidth];
    });
  };

  randomWordsCreator();

  // Function to push target into answer and changing event listener
  function pushIntoAnswer(e) {
    index = e.target.id;
    answerFieldWordsArr.push(e.target);
    if (answerFieldWordsArr.length > 0) {
      checkButton.disabled = false;
      checkButton.classList.remove('disabledCheckButton');
      checkButton.classList.add('enabled-check-button');
    }
    answerField.appendChild(e.target);
    randomWordsArr[index] = "";
    e.target.removeEventListener('click', pushIntoAnswer);
    e.target.classList.remove('word');
    e.target.classList.add('added');
    e.target.style.height = widthHeightArr[index][0] + 'px';
    e.target.style.width = widthHeightArr[index][1] + 'px';
    e.target.addEventListener('click', removingElement);
  }

  // Function to push answer into random array and changing event listener
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

  // Map random array and add event listener
  let arr = Array.from(randomWordsField.children);
  let childArr = arr.map((arr) => arr.children[0]);
  childArr.forEach(w => {
    w.addEventListener('click', pushIntoAnswer);
  });

  // Map answer array and add event listener
  answerFieldWordsArr = Array.from(answerField.children);
  answerFieldWordsArr.map(w => {
    w.addEventListener('click', removingElement);
  });

  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
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

    // Set avatar image
    if (questions[i].pic) {
      avatarImg.src = questions[i].pic;
    }

    sentContainer.appendChild(speakerEl);

    // Create a question element and display it
    const questionText = document.createElement('p');
    questionText.innerText = questions[i].question; // Display the question text
    questionText.className = 'question-text';
    sentContainer.appendChild(questionText);

    // Display random words if they exist for the question
    if (Array.isArray(questions[i].phraseByWord)) {
      questions[i].phraseByWord.forEach((word) => {
        let wordEl = document.createElement('button');
        wordEl.innerText = word; // Directly display the string word
        wordEl.className = 'word-item';
        sentContainer.appendChild(wordEl);
      });
    }
  };

  iterateEachWord(incr);

  // Check answers 
  const checkAnswer = () => {
    answerFieldWordsArr.forEach((item) => {
      let val = item.value;
      answerArr.push(val);
    });
    let ansStr = answerArr.join(' ');

    if (ansStr === data[incr].engPhrase || ansStr === data[incr].answer) {
      sound = new Audio('https://res.cloudinary.com/nzmai/video/upload/v1605697967/lvlupsound_n13hts.mp3');
      sound.play();
      progressStart += progressRange;
      footer.style.display = 'none';
      winFooter.style.display = 'flex';
      progress.style.width = progressStart + '%';
    } else {
      sound = new Audio('https://res.cloudinary.com/nzmai/video/upload/v1605698209/errorsound_jxtmqg.mp3');
      sound.play();
      footer.style.display = 'none';
      loseFooter.style.display = 'flex';
    }
  };

  // Attach event listener to check button
  checkButton.addEventListener('click', checkAnswer);

  const getNewQuestion = (i) => {
    const questions = [...data];
    avatarImg.src = questions[i].pic;
    resetQuestion();
    iterateEachWord(i);
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
});
