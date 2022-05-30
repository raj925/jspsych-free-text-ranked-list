This jspsych plugin allows for participants to record a ranked list of elements, where each element has an attached scale and slider. You might find this useful for experiments where you are interested in how participants consider multiple options for a response, where the order is important. Have a look at example.png for what this would like. In the example, you can imagine that the participant is asked to report a list of preferred fruits, with the scale indicating the nutritonal value and the slider indicating their rating of taste.

There are a number of parameters that you ca manipulate, such as whether the list is draggable, the labels etc. The code for the example would look like this:

    const fruitRanking = 
    {
    	type: jsPsychFreeTextRankedList,
    	prompt: "<p>Input your fruit ranking</p>",
        slider_labels: ["Not At All Tasty", "Very Tasty"],
        slider_start: 5,
        slider_prompt: "Tastiness",
        slider_width:200,
        scale_questions: true,
        scale_labels: ["Low","Medium","High"],
        scale_prompt: "Nutrition",
        add_button_prompt: "Enter the fruit you want to add,
        draggable_list: false
    }


