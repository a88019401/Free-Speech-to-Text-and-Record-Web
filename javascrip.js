let infoBox, textBox, tempBox, startButton, recognition, mediaRecorder;
let final_transcript = ''; // 最終辨識的文字
let recognizing = false; // 辨識狀態
let audioChunks = [];

window.onload = () => {
  infoBox = document.getElementById("infoBox");
  textBox = document.getElementById("textBox");
  tempBox = document.getElementById("tempBox");
  startButton = document.getElementById("startButton");

  initializeSpeechRecognition();

  // 綁定按鈕事件
  startButton.addEventListener("click", toggleRecognitionAndRecording);
};

function initializeSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window)) {
    infoBox.innerText = "本瀏覽器不支援語音辨識，請更換瀏覽器！(Chrome 25 版以上才支援語音辨識)";
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  

  recognition.onstart = () => {
    recognizing = true;
    startButton.value = "停止辨識與錄音";
    infoBox.innerText = "辨識中...";
  };

  recognition.onend = () => {
    recognizing = false;
    startButton.value = "開始辨識與錄音";
    infoBox.innerText = "";
    stopRecording();
  };

  recognition.onresult = (event) => {
    let interim_transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    if (final_transcript.trim()) textBox.value = final_transcript;
    if (interim_transcript.trim()) tempBox.value = interim_transcript;
  };
}

function toggleRecognitionAndRecording() {
  if (recognizing) {
    recognition.stop();
  } else {
    startRecognitionAndRecording();
  }
}

function startRecognitionAndRecording() {
  // 清除上次辨識結果
  final_transcript = '';
  textBox.value = '';
  tempBox.value = '';

  // 開始語音辨識
  recognition.lang = document.getElementById("langCombo").value;
  recognition.start();

  // 開始錄音
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();

      audioChunks = [];
      mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
      };
    });
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); // 使用 webm 格式
      const audioUrl = URL.createObjectURL(audioBlob);
      const downloadLink = document.getElementById("downloadLink");
      downloadLink.href = audioUrl;
      downloadLink.download = 'recording.webm'; // 下載 webm 格式
      downloadLink.style.display = 'inline';
      downloadLink.innerText = '下載錄音';
    };
  }
}


