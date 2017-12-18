'use strict';

function onReady(){
  var timeCtrl = new TimerController();
 var start = document.getElementById('start');
 var pause = document.getElementById('pause');
 var reset = document.getElementById('reset');
var pomodoros = document.getElementById('pomodoros');
 start.addEventListener('click',function(){
  if(timeCtrl.timer === null){
    start.classList.add('disabled');
    timeCtrl.startPTimer();
  }
  if(timeCtrl.timer.isPaused){
    timeCtrl.resumeTimer();
    start.textContent = 'Start';
    pause.classList.remove('disabled')
  }
  return false;
 })

 pause.addEventListener('click',function(){
  if(timeCtrl.timer.isPaused !== true){
    pause.classList.add("disabled");
    start.textContent = "Resume";
    start.classList.remove("disabled");
    timeCtrl.pauseTimer();
  }
  return false;
 })

 reset.addEventListener('click',function(){
  timeCtrl.resetTimer();
  var clock = document.getElementById('clock');
  clock.classList.add('yellow');
  clock.classList.add('lighten-2');
  reset.classList.add('pulse');
  start.classList.add('pulse');
  pause.classList.add('pulse');
  setTimeout(function(){
    clock.classList.remove('yellow');
     clock.classList.remove('lighten-2');
    reset.classList.remove('pulse');
  start.classList.remove('pulse');
  pause.classList.remove('pulse');
  },500);

  })


}

class Timer{
  constructor(finishTime){
    var now = new Date();
    this.start = now.getTime();
    this.finish = finishTime;
    this.difference = this.finish - this.start;
    this.isPaused = false;
    this.pauseTimeRemaining= 0;
   this.progressBar = this.createProgressBar();

  }

  createProgressBar(){
     var barMain  = document.createElement('div');
     barMain.style.border = '1px solid black';
     barMain.style.width = '200px';
     barMain.style.height = '31px';
     barMain.style.borderRadius='5px';
    var bar  = document.createElement('div');
    bar.classList.add('blue');
    bar.style.width=0;
    bar.style.borderRadius='5px';
    bar.style.height = '30px';
    barMain.appendChild(bar);
    
    this.barMain = barMain;
    return bar;

  }
  timeRemaining(){
    var now = new Date();
    return (this.finish - now.getTime());
  }

  percentage(){
    var percentage = 100 - ((this.timeRemaining()/this.difference)*100);
    if(percentage > 100){
      percentage = 100;
    }
      return percentage;
  }

  isEnded(){
    if(this.timeRemaining() < 0 && !this.isPaused){
      return true;
    }
    return false;
  }


  pause(){
    this.pauseTimeRemaining = this.timeRemaining();
    this.isPaused = true;
  }

  resume(){
    var now = new Date();
    this.finish = (now.getTime() + this.pauseTimeRemaining);
    this.isPaused = false;
  }

  hrsMinSecRemaining(){
    var totalSeconds = this.timeRemaining()/1000;
    var hours = parseInt(totalSeconds/3600,10)%24;
    var minutes = parseInt(totalSeconds/60,10)%60;
    var seconds = parseInt(totalSeconds%60,10);
    if(seconds<0) seconds = 0;
    var timeObject = {
      "hours":hours<10 ? "0" + hours : hours,
      "minutes":minutes<10 ? "0" + minutes: minutes,
      "seconds" : seconds <10 ? "0" + seconds : seconds
    };

    return timeObject;
  }

  tickler(){
    var running = true;
    var paused = false;
    var timeObj = null;
    if(this.isEnded() || this.isPaused){
      running = false;
    }else{
      running = true;
    }

    if(this.isPaused){
      paused = true;
      timeObj = null;
    }else{
      paused = false;
      timeObj = this.hrsMinSecRemaining();
    }
    return {"running":running,"paused":paused,"timeObject":timeObj,"percentage":this.percentage()}

  }
}



class TimerController{
  constructor(){
    this.pomodoros = 0;
    this.maxPomodoros = 4;
    this.timerType = null;
    this.timer = null;
    this.timerType=null;
  }

  startPTimer(){
    this.startTimer(this.pomodoroFinishTime(),"pomodoro");
  };
  startShortBreakTimer(){
    this.startTimer(this.shortBreakFinishTime(),"short");
  }
  startLongBreakTimer(){
    this.startTimer(this.longBreakFinishTime(),"long");
  }

  startTimer(finishTime,type){
    this.setTimerType(type);
    this.timer = new Timer(finishTime);
    var pomodoros = document.getElementById('pomodoros');
  
    pomodoros.appendChild(this.timer.barMain);
    var that = this;
    var interval = setInterval(function(){tickler(that,interval);},1000);

    function tickler(timeCtrl,interval){
      var result = timeCtrl.timer.tickler();
      if(result.timeObject){
        timeCtrl.updateView(result);
      }
      if(result.running === false && result.paused ===false){
        clearInterval(interval);
        timeCtrl.routeTimer();
      }
    }
  }

  updateView(result){
    var bar = this.timer.progressBar;
    bar.style.width = this.timer.percentage()+'%';
    var display = document.getElementById('display');
    display.textContent = result.timeObject.minutes + ':' + result.timeObject.seconds;

  }

  pauseTimer(){
    if(this.timer.isPaused !==true){
      this.timer.pause();
    }
  }

  resumeTimer(){
    if(this.timer.isPaused === true){
      this.timer.resume();
    }
  }

  resetTimer(){
    
     pomodoros.innerHTML = '0' +' <small>pomodoros</small>';
     this.startPTimer();
  }

  routeTimer(){
    if(this.timerType === "pomodoro"){
      this.pomodoros++;
      
      pomodoros.innerHTML = this.pomodoros +' <small>pomodoros</small>';
      console.log(this.pomodoros);
      if(this.pomodoros % 4 === 0){
        this.startLongBreakTimer();
      }else{
        this.startShortBreakTimer();
      }
    }else if(this.timerType === "short"){
      this.startPTimer();
    }else if(this.timerType === "long"){
      this.startPTimer();
    }else{
      this.startShortBreakTimer();
    }
  }

  setTimerType(type){
    if(type === "pomodoro" || type === "short" || type ==="long"){
      this.timerType = type;
    }
  }


  pomodoroFinishTime(){
    return this.now() + this.getPomTime();
  }

  shortBreakFinishTime(){
    return this.now() + this.getShortBreakTime();
  }

  longBreakFinishTime(){
    return this.now() + this.getLongBreakTime();
  }

  getPomTime(){
    var time = document.getElementById('pomodoro-time').value;
    console.log(time);
    if(this.isValidTime(time) === false){
      time = 25;
    }
    return (time * 60) * 1000; //in milliseconds
  }

  getShortBreakTime(){
    var time = document.getElementById('short-break-time').value;
    if(this.isValidTime(time)===false){
      time = 5;
    }
    return (time*60)*1000;
  }

  getLongBreakTime(){
     var time = document.getElementById('long-break-time').value;
    if(this.isValidTime(time)===false){
      time = 15;
    }
    return (time*60)*1000;
  }

  now(){
    var now = new Date();
    return now.getTime();
  }

  isValidTime(time){
    if(time === null || isNaN(time) || time === ""){
      return false;
    }
    return true;
  }

}



 window.onload= onReady;