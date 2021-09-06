function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample)
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// Create the buildCharts function.
function buildCharts(sample) {
  // Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // Create a variable that holds the samples array. 
    var sampledata = data.samples
    // Create a variable that filters the samples for the object with the desired sample number.
    var filteredsamples = sampledata.filter(sampleObj => sampleObj.id == sample)
    
    // Create a variable that holds the first sample in the array.
    var result = filteredsamples[0];

    // Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otu_ids = result.otu_ids;
    var otu_labels = result.otu_labels;
    var sample_values = result.sample_values

    // Create the yticks for the bar chart

    var yticks = otu_ids.slice(0, 10).map(String).map(tick => "OTU " + tick)
    
    // Create the trace for the bar chart. 
    var barData = [{
      x: sample_values,
      y: yticks,
      type: 'bar',
      text: otu_labels,
      orientation: 'h'
    }];

    // Create the layout for the bar chart. 
    var barLayout = {
      title: "<b>Top 10 Bacteria Cultures Found</b>",
      yaxis: {
        autorange: 'reversed'
      }
    };
    
    // Use Plotly to plot the data with the layout. 
    Plotly.newPlot('bar', barData, barLayout)

    // create size array for bubble array at 80% scale
    var size_values = sample_values.map(sample => sample * 0.8)

    // Create data for bubble chart
    var bubble_data = [{
      x: otu_ids,
      y: sample_values,
      mode: 'markers',
      text: otu_labels,
      type: 'scatter',
      marker: {
        size: size_values,
        color: otu_ids,
        colorscale: 'YlGnBu'
      }
    }];

    // Create layout for bubble chart
    var bubble_layout = {
        title: "<b>Bacteria Cultures Per Sample</b>",
        hovermode: 'closest',
        xaxis: {
          title: "OTU ID"
        }
    };

    // Create bubble chart in 'bubble' div
    Plotly.newPlot("bubble", bubble_data, bubble_layout);

    // Create metadata object
    var metadata = data.metadata;

    // Gather washing frequency for a id slected
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    var wfreq = parseFloat(result.wfreq);

    // Create trace array for gauge chart
    var gauge_data = [{
      value: wfreq,
      type: 'indicator',
      mode: 'gauge+number',
      gauge: {
        axis: { range: [null, 10], dtick: 2 },
        bar: { color: "black" },
        steps: [
          { range: [0, 2], color: "red" },
          { range: [2, 4], color: "orange" },
          { range: [4, 6], color: "yellow" },
          { range: [6, 8], color: 'yellowgreen' },
          { range: [8, 10], color: "green" }
        ]
      }
    }];
    

    // Create Layout object for gauge chart
    var gauge_layout = {
      title: '<b>Belly Button Washing Frequency</b><br><br> Scrubs Per Week',
    };

    // Use plotly to display gauge chart
    Plotly.newPlot('gauge', gauge_data, gauge_layout)
    
  });
}
