/** This jspysch plugin allows for trials where participant responses
* comprise of a ranked/ordered list of items, that they input via free text.
* Each item then has an attached scale and slider.
*
* Author: Sriraj Aiyer.
*
*/

var jsPsychFreeTextRankedList = (function (jspsych) {
  'use strict';

  const info = {
      name: "free-text-ranked-list",
      parameters: 
      {
      	  /** Any content here will be displayed under the button. */
          prompt: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Prompt",
              default: null,
          },
          /** How long to show the trial. */
          trial_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Trial duration",
              default: null,
          },
          /** If true, then trial will end when user responds. */
          response_ends_trial: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Response ends trial",
              default: true,
          },
          /** The text that appears on the button to continue to the next trial. */
          button_label: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Button label",
              default: "Continue",
          },
          /** If true, the trial does not start with any items in the list */
          start_empty: {
          	type: jspsych.ParameterType.BOOL,
            pretty_name: "Start Empty",
            default: true,
          },
          /** If start_empty is false, this is the list of ordered items to show from the start of the trial */
          starting_list: {
          	  type: jspsych.ParameterType.STRING,
              pretty_name: "Starting List",
              default: [],
              array: true,
          },
          /** If start_empty is false, this is the list of slider values to start with. */
          starting_sliders: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Starting Sliders",
              default: [],
              array: true,
          },
          /** If start_empty is false, this is the list of scale values to start with. */
          starting_scales: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Starting Scales",
              default: [],
              array: true,
          },
          /** If true, enforce a limit on the number of items that can be added to the list. **/
          item_limit: {
          	type: jspsych.ParameterType.BOOL,
          	pretty_name: "Item Limit",
          	default: false,
          },
          /** The minimum number of items that should be added to the list before submitting. **/
          item_minimum: {
          	type: jspsych.ParameterType.INT,
          	pretty_name: "Item Minimum",
          	default: 1
          },
          /** Set the maxmimum number of items that can be added if item_limit is true **/
          max_items: {
          	type: jspsych.ParameterType.INT,
          	pretty_name: 'Max Item Number',
          	default: 5
          },
          /** Sets the minimum value of the sliders. */
          min: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Min slider",
              default: 0,
          },
          /** Sets the maximum value of the sliders */
          max: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Max slider",
              default: 10,
          },
          /** Sets the starting value of the sliders */
          slider_start: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Slider starting value",
              default: 50,
          },
          /** Put this prompt above the slider*/
          slider_prompt: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Slider Label",
              default: "",
          },
          /** Sets the step of the sliders */
          step: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Step",
              default: 1,
          },
          /** Width of the slider in pixels. */
          slider_width: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Slider width",
              default: null,
          },
          /** Array containing the height (first value) and width (second value) of the canvas element. */
          canvas_size: {
              type: jspsych.ParameterType.INT,
              array: true,
              pretty_name: "Canvas size",
              default: [500, 100],
          },
          /** Array containing the labels for the slider. Labels will be displayed at equidistant locations along the slider. */
          slider_labels: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Slider Labels",
              default: [],
              array: true,
          },
          /** If true, scale question is included for each element in the list.**/
          scale_questions: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Scale Questions",
              default: false,
          },
          /** What labels to use for the scale questions if scale_questions is true. Number of elements = number of options**/
          scale_labels: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Scale Labels",
              default: [],
              array: true,
          },
          /** Text to show on screen when the participant adds an element to the list. **/
          add_button_prompt: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Scale Prompt",
              default: "Enter the name of the element that you want to add",
          },
          /** Text to show above the scale **/
          scale_prompt: {
            type: jspsych.ParameterType.STRING,
              pretty_name: "Scale Prompt",
              default: "",
          },
          /** Error message to show if participant has not filled in a scale option (so all scales are mandatory) **/
          blank_scale_error: {
            type: jspsych.ParameterType.STRING,
              pretty_name: "Scale Prompt",
              default: "A scale option has not been provided!",
          },
          /** If true, allow the participant to reorder list elements by dragging and dropping **/
          draggable_list : {
            type: jspsych.ParameterType.BOOL,
            pretty_name: "Draggable List",
            default: true,
          }
      }
  };

  // We reload the current list of elements every time there is an 'update'
  // (eg an element is added, an element is removed)
  function populateButtons (list,trial,display_element,slider_vals=[],scale_vals=[]) 
  { 
      let liHTML;
      let sortList = document.getElementById("sortList");
      sortList.innerHTML = "";
      for (let i=0; i<list.length; i++)
      {
        let li = document.createElement("li");
        liHTML = "<table style='width: 100%; table-layout: fixed;'><tr><td>"
        liHTML += "<li id ='ListElementName" + i + "'; style='color:red;'>" + list[i]; // Element name
        liHTML += "</td><td>";

          // add options
          var width = 100 / trial.scale_labels.length;
          var options_string = '<ul class="jspsych-survey-likert-opts" id="scale' + i + '"><table><tr>';
          options_string += '<li id="scaleLabel" style="list-style-type: none; font-size: small; color:skyblue; transform: translate(15%, -20%)">' + trial.scale_prompt + '</li>'
          for (var j = 0; j < trial.scale_labels.length; j++) {
              let check = '';
              if (scale_vals.length > 0 && (scale_vals[i]) == j)
              {
                check = 'checked="checked"'; // check in the right scale option if previous done
              }
              options_string +=
                  '<th><li style=" list-style-type:none; width:' +
                      width +
                      '%"><label class="jspsych-survey-likert-opt-label"><input type="radio" ' + check + 'name="Q' +
                      list[i] +
                      '" value="' +
                      j +
                      '"';
              options_string += " required";
              options_string += ">" + trial.scale_labels[j] + "</label></li></th>";
          }
          options_string += "</tr></table></ul>";
          liHTML += options_string;
          liHTML += "</td><td>";


          // add slider
            liHTML +='<li id="scaleLabel" style="list-style-type: none; font-size: small; color:skyblue; transform: translate(15%, -100%)">' + trial.slider_prompt + '</li>'
            liHTML += '<div id="jspsych-canvas-slider-response-wrapper-' + (i+1);
          liHTML +=
              '<div class="jspsych-canvas-slider-response-container" style="position:relative; width:';
          if (trial.slider_width !== null) {
              liHTML += trial.slider_width + "px;";
          }
          else {
              liHTML += trial.canvas_size[1] + "px;";
          }
          
          liHTML += '">';

          let sliderStart;
          if (slider_vals.length > 0)
          {
            sliderStart = slider_vals[i]; // Get the previous slider value 
          }
          else
          {
            sliderStart = trial.slider_start;
          }

          liHTML +=
              '<input type="range" id="slider' + i + '" value="' +
                  sliderStart +
                  '" min="' +
                  trial.min +
                  '" max="' +
                  trial.max +
                  '" step="' +
                  trial.step +
                  '" style="width: 100%;" class="jspsych-canvas-slider-response-response" id="jspsych-canvas-slider-response-response-' + (i+1) + '"></input>';
          liHTML += "<div>";
          for (var j = 0; j < trial.slider_labels.length; j++) {
              var width = 100 / (trial.slider_labels.length - 1);
              var left_offset = j * (100 / (trial.slider_labels.length - 1)) - width / 2;
              liHTML +=
                  '<div style="display: inline-block; position: absolute; left:' +
                      left_offset +
                      "%; text-align: center; width: " +
                      width +
                      '%;">';
              liHTML += '<span style="text-align: center; font-size: 60%;">' + trial.slider_labels[j] + "</span>";
              liHTML += "</div>";
          }
          liHTML += '</div>';
          liHTML += '</div>';
          liHTML += '</div>';  
          liHTML += "</td><td>";


          liHTML += '<span class="close" style="color:red;">x</span></td></tr></table></li>';


        li.innerHTML = liHTML;
        li.id = "ListElement" + i;
        li.className = "ListElement";
        li.draggable = true;
        sortList.appendChild(li);
      }

        let plus = document.createElement("li"); 
        plus.id = "addBox"; // Button for participant to add a new element to the list.
        sortList.appendChild(plus);
        plus.innerHTML = '<li><span id="add" class="add">+</span></li>';
        let add = document.getElementById("add");
        add.addEventListener("click", function() // when the plus button is clicked
        {
            plus.innerHTML = '<li><form action=""><input type="text" id="inputText" placeholder=' + trial.add_button_prompt + '></input><span class="confirm" id="confirm">+</span></form></li>';
            var q_element = document.getElementById("inputText");
            display_element.querySelector(q_element.focus()); // add a new textbox when participants add the name of the element.
            q_element.onclick = function(e) {
              q_element.focus();
            };
            q_element.onfocus = function(e) {
              q_element.select();
            };
            let confirm = document.getElementById("confirm"); // participant types the element and then clicks to add it to the list.
            confirm.addEventListener("click", function()
            {
              let val = (q_element.value).toUpperCase();
              if (val.length > 2 && !list.includes(val)) // if they input a blank string or a single letter, do not add to list.
              {
                list.push(val);
                let sliderValues = [];
                let scaleValues = [];
                for (let x = 0; x<1000; x++)
                {
                  let id = "ListElement" + x
                  if (document.getElementById(id) == null) // run through current list elements
                  {
                    break;
                  }
                  else
                  { // we need the current slider and scale values so that when a new element is added
                    // and the list is relaoded, those values are preserved.
                    let slider = "slider" + x;
                    sliderValues.push(parseInt((document.getElementById(slider)).value));
                    let scale = "scale" + x;
                    var match = display_element.querySelector("#" + scale);
                    var inputboxes = match.querySelectorAll("input[type=radio]:checked");
                    if (inputboxes.length < 1)
                    {
                      scaleValues.push(-1);
                    }
                    else
                    {  
                      scaleValues.push(parseInt(inputboxes[0].value));
                    }
                  }
                }
                populateButtons(list,trial,display_element,sliderValues,scaleValues); 
              }
            });

            q_element.addEventListener("keypress", function(event) {
                if (event.key === "Enter") { // do same thing if participant presses enter after typing element.
                    event.preventDefault();
                    let val = (q_element.value).toUpperCase();
                    if (val.length > 2 && !list.includes(val))
                    {
                      list.push(val);
                      let sliderValues = [];
                      let scaleValues = [];
                      for (let x = 0; x<1000; x++)
                      {
                        let id = "ListElement" + x
                        if (document.getElementById(id) == null)
                        {
                          break;
                        }
                        else
                        {
                          let slider = "slider" + x;
                          sliderValues.push(parseInt((document.getElementById(slider)).value));
                          let scale = "scale" + x;
                          var match = display_element.querySelector("#" + scale);
                          var inputboxes = match.querySelectorAll("input[type=radio]:checked");
                          if (inputboxes.length < 1)
                          {
                            scaleValues.push(-1);
                          }
                          else
                          {  
                            scaleValues.push(parseInt(inputboxes[0].value));
                          }
                        }
                      }
                      populateButtons(list,trial,display_element,sliderValues,scaleValues);
                    }
                }
            });
        });

      // participants can reorder the list by dragging and dropping elements in the list.
      // if draggable_list is false, the elements are fixed in their position when added.
      if (trial.draggable_list)
      {
        let items = sortList.getElementsByTagName("li"), current=null;

        // MAKE ITEMS DRAGGABLE + SORTABLE
        for (let i of items) 
        {
            // ATTACH DRAGGABLE
            //i.draggable = true;
            
            // DRAG START - YELLOW HIGHLIGHT DROPZONES
            i.ondragstart = (ev) => {
              current = i;
              for (let it of items) {
                if (it != current) { it.classList.add("hint"); }
              }
            };
            
            // DRAG ENTER - RED HIGHLIGHT DROPZONE
            i.ondragenter = (ev) => {
              //if (i != current) { i.classList.add("active"); }
              i.classList.add("active");
            };

            // DRAG LEAVE - REMOVE RED HIGHLIGHT
            i.ondragleave = () => {
              i.classList.remove("active");
            };

            // DRAG END - REMOVE ALL HIGHLIGHTS
            i.ondragend = () => { for (let it of items) {
                it.classList.remove("hint");
                it.classList.remove("active");
            }};
         
            // DRAG OVER - PREVENT THE DEFAULT "DROP", SO WE CAN DO OUR OWN
            i.ondragover = (evt) => { evt.preventDefault(); };
       
            // ON DROP - DO SOMETHING
            i.ondrop = (evt) => {
              evt.preventDefault();
              if (i != current) {
                let currentpos = 0, droppedpos = 0;
                for (let it=0; it<items.length; it++) {
                  if (current == items[it]) { currentpos = it; }
                  if (i == items[it]) { droppedpos = it; }
                }
                if (currentpos < droppedpos) {
                  i.parentNode.insertBefore(current, i.nextSibling);
                } else {
                  i.parentNode.insertBefore(current, i);
                }
              }
            };
         }
      }

      /* Get all elements with class="close" */
      var closebtns = document.getElementsByClassName("close");

      /* Loop through the elements, and hide the parent, when clicked on */
      for (var i = 0; i < closebtns.length; i++) 
      {
        let id = "ListElement" + i;

        closebtns[i].addEventListener("click", function() 
        {
          let ele = document.getElementById(id);
          ele.style.display = 'none';
          ele.remove();

          let num = parseInt(id.replace('ListElement',''));
          list.splice(num,1);
          slider_vals.splice(num,1);
          scale_vals.splice(num,1)

          let items = document.getElementsByClassName("ListElement");
          let count = 0;
          for (let item of items) 
          {
            item.id = "ListElement" + count;
            count++;
          }
          populateButtons(list,trial,display_element,slider_vals,scale_vals);
        });
      }

  }
  /**
   * **free-text-ranked-list**
   *
   * jsPsych plugin for being able to add items to list via typing 
   * and then dragging to rearrange the list
   *
   * @author Sriraj Aiyer
   * @see {@link https://www.jspsych.org/plugins/jspsych-free-sort/ free-sort plugin documentation on jspsych.org}
   */
  class FreeTextRankedListPlugin {
      constructor(jsPsych) 
      {
          this.jsPsych = jsPsych;
      }
      trial(display_element, trial) 
      { 
      	  var height, width;
          var html = "";
	  	    // store response
          var response = {
              rt: null,
              responses: [],
              sliderValues: [],
              scaleValues: [],
              startingList: [],
              startingSliders: [],
              startingScales: []
          };


          if (trial.prompt !== null) {
              html += trial.prompt;
          }

          html += '<ul id="sortList"></ul>';

          // add submit button
          html +=
              '<button id="jspsych-canvas-slider-response-next" class="jspsych-btn" ' +
                  (trial.start_empty ? "disabled" : "") +
                  ">" +
                  trial.button_label +
                  "</button>";
          display_element.innerHTML = html;

          var start_time = performance.now();

          let sortList = document.getElementById("sortList");
          let plus = document.createElement("li");
          plus.id = "addBox";
          sortList.appendChild(plus);
          plus.innerHTML = '<li><span class="add" id="add">+</span></li>';
          let add = document.getElementById("add");
          add.addEventListener("click", function() 
          {
              plus.innerHTML = '<li><form action=""><input type="text" id="inputText" placeholder=' + trial.add_button_prompt + '></input><span class="confirm" id="confirm">+</span></form></li>';
              var q_element = document.getElementById("inputText");
              display_element.querySelector(q_element.focus());
              q_element.onclick = function(e) {
                q_element.focus();
              };
              q_element.onfocus = function(e) {
                q_element.select();
              };

              let confirm = document.getElementById("confirm"); 
              confirm.addEventListener("click", function()
              {
                let val = q_element.value;
                if (val.length > 2)
                {
                  plus.remove();
                  let newList = [];
                  newList.push((q_element.value).toUpperCase());
                  document.getElementById("jspsych-canvas-slider-response-next").disabled = false;
                  populateButtons(newList,trial,display_element);
                }
              });

              q_element.addEventListener("keypress", function(event) {
                  if (event.key === "Enter") {
                      event.preventDefault();
                      let val = q_element.value;
                      if (val.length > 2)
                      {
                        plus.remove();
                        let newList = [];
                        newList.push((q_element.value).toUpperCase());
                        document.getElementById("jspsych-canvas-slider-response-next").disabled = false;
                        populateButtons(newList,trial,display_element);
                      }
                  }
              });

          });

          /* Get all elements with class="close" */
          var closebtns = document.getElementsByClassName("close");
          /* Loop through the elements, and hide the parent, when clicked on */
          for (var i = 0; i < closebtns.length; i++) 
          {
            let id = "ListElement" + i;
            closebtns[i].addEventListener("click", function() 
            {
              let ele = document.getElementById(id);
              ele.style.display = 'none';
              let closed = response.responses[i];
              ele.remove();
            });
          }

          let startingList = [];
          if (!(trial.start_empty)) //start trial with preloaded list of elements if provided.
          {
          	startingList = trial.starting_list;
          	response.startinglist = startingList;
          	response.responses = startingList;
            response.startingSliders = trial.starting_sliders;
            response.startingScales = trial.starting_scales;
            populateButtons(startingList,trial,display_element,trial.starting_sliders,trial.starting_scales);
				  }


          let nextButton = document.getElementById("jspsych-canvas-slider-response-next");
          nextButton.addEventListener("click", function() {
            var end_time = performance.now();
            var rt = Math.round(end_time - start_time);
            response.totalTime = parseInt(rt);
            response.responses = [];
            response.sliderValues = [];
            response.scaleValues = [];
            let errorStyle = "style='color: red;position: absolute;left: 50%;transform: translate(-50%, -50%);top: 60%;'";
            let genError = document.querySelector('div.jspsych-content-wrapper').appendChild(document.createElement('div'));
            genError.innerHTML = "<div " + errorStyle + ">" + trial.blank_scale_error + "</div>"; //check that all scales are filled in.
            genError.classList.add('hidden');
            genError.id = "genError";
            let success = false;
            for (let x = 0; x<1000; x++)
            {
              let id = "ListElementName" + x
              if (document.getElementById(id) == null)
              {
                success = true;
                break;
              }
              else
              {
                response.responses.push((document.getElementById(id)).innerText);
                let slider = "slider" + x;
                response.sliderValues.push(parseInt((document.getElementById(slider)).value));
                let scale = "scale" + x;
                var match = display_element.querySelector("#" + scale);
                var inputboxes = match.querySelectorAll("input[type=radio]:checked");
                if (inputboxes.length < 1)
                {
                 genError.classList.remove('hidden');
                 break;
                }
                else
                {  
                  response.scaleValues.push(parseInt(inputboxes[0].value));
                  let err = document.getElementById("genError");
                  if (err !== null)
                  {
                    err.remove();
                  }
                }
              }
            }
            if (success)
            {
              end_trial();
            }
          });      

          // function to end trial when it is time
          const end_trial = () => {
              // kill any remaining setTimeout handlers
              this.jsPsych.pluginAPI.clearAllTimeouts();
              // gather the data to store for the trial
              var trial_data = {
                  rt: response.rt,
                  response: response.responses,
                  sliderValues: response.sliderValues,
                  scaleValues: response.scaleValues,
                  startinglist: response.startinglist
              };
              // clear the display
              display_element.innerHTML = "";
              // move on to the next trial
              this.jsPsych.finishTrial(trial_data);
          };
          // end trial if time limit is set
          if (trial.trial_duration !== null) {
              this.jsPsych.pluginAPI.setTimeout(() => {
                  end_trial();
              }, trial.trial_duration);
          }
      }
  }
  FreeTextRankedListPlugin.info = info;

  return FreeTextRankedListPlugin;
})(jsPsychModule);