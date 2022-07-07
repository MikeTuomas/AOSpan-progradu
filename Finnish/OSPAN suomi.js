src="jspsych-html-keyboard-response.js"
src="jspsych-html-button-operationspan.js"
src="jspsych-operation-span-recall.js"
src="jstat.min.js"
/*
    This is a web-based operation span working memory test.
    It is modelled after the operation span test described in Oswald et al (2014) [https://link.springer.com/article/10.3758/s13428-014-0543-2].
    However, users can easily customize this test for their own purposes.
    Easily customizable variables have been listed below. For further changes to the test, knowledge of JavaScipt may be required.

    For smooth functioning of the test, make sure all the associated github files within the repository have been downloaded (especially the folder named 'jspsych-6.0.4').
    Results from this test will be automatically downloaded into the downloads folder of your desktop.

    For further details, please refer to the README.
*/

//----- CUSTOMIZABLE VARIABLES -----------------------------------------

minSetSize = 4 // starting length of each trial (i.e., min number of letters in a trial)
maxSetSize = 6 // ending length of each trial (i.e., max number of letters in a trial)
repSet = 2 // number of times each set size should be repeated
randomize = true // present different set sizes in random order. if false, set sizes will be presented in ascending order
file_name = null // file name for data file. if null, a default name consisting of the participant ID and a unique number is chosen.
local = false // save the data file locally.
            // If this test is being run online (e.g., on MTurk), true will cause the file to be downloaded to the participant's computer.
            // If this test is on a server, and you wish to save the data file to that server, change this to false.
            // If changed to false, ensure that the php file (its in the directory!) and the empty "data" folder has also been appropriately uploaded to the server.
            // Incase of problems, feel free to contact me :)

//----------------------------------------------------------------------

var possibleLetters = ["F","H","J","K","L","N","P","Q","R","S","T","V"]

var setSizes = []    // different set sizes
for (var i = minSetSize; i<= maxSetSize; i++){
  for (var r = 1; r<= repSet; r++){
    setSizes.push(i)
  }
}

var nTrials = setSizes.length // number of trials

if (randomize){
  setSizes = jsPsych.randomization.sampleWithoutReplacement(setSizes, nTrials)
} // shuffle through the set sizes

var n = 0 //keeps track of number of trials gone by
var selection = jsPsych.randomization.sampleWithoutReplacement(possibleLetters, setSizes[n])
var selection_id = 0 //keeps track of recall items within a test stack

var nLetterRecalled = 0 // feedback
var nMathAcc = 0 // feedback

var cogloadf = function(correct){  // generates math questions
  var possibleOperations = [" + ", " - "]
  operation = jsPsych.randomization.sampleWithReplacement(possibleOperations, 1)[0]
  if (operation==" + "){
    num1 = Math.floor(jStat.uniform.sample(1, 11))
    num2 =  Math.floor(jStat.uniform.sample(1, 11))
    ans = num1 + num2
  } else if (operation==" - "){
    num1 = Math.floor(jStat.uniform.sample(1, 11))
    num2 = Math.floor(jStat.uniform.sample(1, num1))
    ans = num1 - num2
  }
  if (!correct){   // generates incorrect answers
    ansDiff = jsPsych.randomization.sampleWithReplacement([1,2],1)[0]
    coinFlip = jsPsych.randomization.sampleWithReplacement([true, false],1)[0]
    if (coinFlip){
      ans += ansDiff
    } else {
      ans -= ansDiff
    }
    if (ans<0){
      ans += 2*ansDiff //ensuring no negative incorrect answers
    }
  }
  return '<div style="font-size:46px;">'+num1+operation+num2+' = '+ans+'<br><br><br><br></div>'
}

var instructions5 = {
  type: 'instructions',
  pages: function(){
    pageOne = '<div style="font-size:20px;">\
    <b>Seuraavaksi aloitetaan itse tehtävä.</b><br>\
    Jatka eteenpäin vain, jos olet ymmärtänyt tehtävän.<br><br>\
    Paina "Seuraava" aloittaaksesi tehtävän.<br><br></div>'
    return [pageOne]
  },
  allow_backward: false,
  button_label_next: "Seuraava",
  show_clickable_nav: true
}

var cog_load_demo = {
  type: 'html-button-operationspan',
  equation_accuracy: function(){
      nCogLoadDemo +=1
      if (nCogLoadDemo==1){
        eqCorrect = true
      } else if (nCogLoadDemo==2){
        eqCorrect = false
      } else {
        eqCorrect = jsPsych.randomization.sampleWithReplacement([true, false], 1)[0]
      }
      return eqCorrect
    },
  stimulus: function(){
    return cogloadf(eqCorrect)
  },
  choices: ["Oikein", "Väärin"],
  on_finish: function(){
    var acc = jsPsych.data.get().last(1).values()[0].accuracy;
    if (acc==1){
      nMathAcc+=1
    }
  }
}

var cog_load = {
  type: 'html-button-operationspan',
  equation_accuracy: function(){
      eqCorrect = jsPsych.randomization.sampleWithReplacement([true, false], 1)[0]
      return eqCorrect
  },
  stimulus: function(){
    return cogloadf(eqCorrect)
  },
  trial_duration:6000,
  choices: ["Oikein", "Väärin"],
  on_finish: function(){
    var acc = jsPsych.data.get().last(1).values()[0].accuracy;
    if (acc==1){
      nMathAcc+=1
    }
  }
}

var test_stimuli = {
  type: 'html-keyboard-response',
  stimulus: function(){
    return '<div style="font-size:70px;">'+selection[selection_id]+'<br><br><br><br></div>'
  },
  choices: jsPsych.NO_KEYS,
  trial_duration: 1000,
  on_finish: function(){
    selection_id += 1
  }
}


var end_test_stimuli = {
  type: 'html-keyboard-response',
  stimulus: " ",
  choices: jsPsych.NO_KEYS,
  trial_duration: 0,
  on_finish: function(){
     if (selection_id>=selection.length){
         jsPsych.endCurrentTimeline()
       }
     }
 }

var recall = {
  type: 'operation-span-recall',
  correct_order: function(){
    return selection
  },
  data: function(){
    return {set_size: setSizes[n]}
  },
  on_finish: function(){
    nLetters = setSizes[n]
    nLettersRecalled = jsPsych.data.get().last(1).values()[0].accuracy;
    n+=1
    selection = jsPsych.randomization.sampleWithoutReplacement(possibleLetters, setSizes[n])
    selection_id = 0
  }
}

var feedback = {
    type: 'instructions',
    pages: function(){
      pageOne = "<div style='font-size:20px;'><b>Muistit <font color='blue'>"+nLettersRecalled+" / "+nLetters+"</font> kirjainta niiden oikeassa järjestyksessä</b><br><br>\
      Ratkaisit <font color='blue'>"+nMathAcc+" / "+nLetters+"</font> laskutehtävää oikein<br><br></div>"

      return [pageOne]
    },
    allow_backward: false,
    button_label_next: "Seuraava",
    show_clickable_nav: true,
    on_finish: function(){
      nMathAcc = 0
    }
  }

var feedbackLoad = {
  type: 'html-keyboard-response',
  stimulus: function(){
    var text = ""
    var accuracy = jsPsych.data.get().last(1).values()[0].accuracy
    if (accuracy==1){
      text += '<div style="font-size:35px; color:rgb(0 220 0)"><b>Oikea vastaus<br><br><br><br></div>'
    } else{
      text += '<div style="font-size:35px; color:rgb(240 0 0)"><b>Väärä vastaus<br><br><br><br></div>'
    }
    //text += '<div style="font-size:30px; color:rgb(0 0 0)"><br><br>New trial starting now.</div>'
    return text
  },
  choices: jsPsych.NO_KEYS,
  trial_duration: 1000
}

var conclusion = {
  type: 'html-keyboard-response',
  stimulus: function(){
    return '<div style="font-size:20px;">Tehtävä on ohi.<br><br>Kiitos osallistumisestasi. <br><br>Paina välilyöntiä lopettaaksesi tehtävä.</div>'
}
}

var test_stack = {
  timeline: [test_stimuli, cog_load, end_test_stimuli],
  repetitions: 10
}

var test_procedure = {
  timeline: [test_stack, recall, feedback],
  repetitions: nTrials
}

console.log(setSizes)
console.log(selection)

timeline = []
timeline.push({
  type: 'fullscreen',
  fullscreen_mode: true,
  message: '<p>Testi siirtyy kokoruudulle painamalla näppäintä.</p>'
});

timeline = timeline.concat([instructions5, test_procedure])
timeline.push({
type: 'fullscreen',
fullscreen_mode: false
});
timeline.push(conclusion)

jsPsych.init({
  timeline: timeline,
  on_finish: function() {
    window.location.href = "https://www.jyu.fi/fi" //the experiment has to finish to record data properly
    //jsPsych.data.displayData();// // comment out if you do not want to display results at the end of task
  }
});