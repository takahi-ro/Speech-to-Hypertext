// Speech to Text の初期設定
SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'ja-JP';
recognition.interimResults = true;
recognition.continuous = true;

//日本語と英語の切り替え
let wikiLang = 'ja';
function SetLanguage(){
  let SetLang = document.form.langSelect;
  let SetLangIndex = SetLang.selectedIndex;
  let SettingLang = SetLang.options[SetLangIndex].value;
  recognition.stop();
  wikiLang = SettingLang;
  recognition.lang = SettingLang == "ja" ? 'ja-JP' : 'en-US';
}

//TinySegmenterのインスタンス作成
const segmenter = new TinySegmenter();                
    
// マイクのOnOffボタンを押した時の処理
const onOffCb = document.getElementById('onoff-cb');
const toggleButton = document.getElementById('onoff');
const toggleButtonClass = toggleButton.classList;

onOffCb.addEventListener('click', () => {
  const parent = onOffCb.parentElement;
  if(onOffCb.checked){
    parent.classList.add('active');
    recognition.start();
  } else{
    parent.classList.remove('active');
    recognition.stop();
  }
});

//音声認識機能が途切れたときに再開
recognition.onend = function () {
  if (toggleButtonClass.contains('active')) {
    console.log('recognition restarted!');
    try {
      recognition.start();
    }
    catch (error) {
      console.error('音声認識は既に開始されています', error);
    }
  }
};

// 音声認識結果を表示する
const resultDiv = document.getElementById('result');
let msg = '';
let hpComponent = [];
let segs;

recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal){

        msg = event.results[i][0].transcript;
        segs = segmenter.segment(msg);
        for(i = 0; i < segs.length; i++){
          let url = `https://${wikiLang}.wikipedia.org/wiki/`  + encodeURIComponent(segs[i]);
          hpComponent.push(`<a href="${url}" target="_blank">` + segs[i] + '</a>');
        } 
        
      }
    }   

    resultDiv.innerHTML += ` ${hpComponent.join(" ")}`; 
    hpComponent = [];
  }

//Web Speech APIが使えない場合のエラー処理
const errorDiv = document.getElementById('error');
recognition.onerror = (event) => {
  if(event.error == 'not-allowed'){
    errorDiv.textContent = '音声認識が動作しない環境です。パソコンのChromeブラウザでお試しください。';
  }
};
