//Firebase config below
var firebaseConfig = {
    apiKey: "AIzaSyAaz7-4wWcU7ih7958VTqUtRN1vR3yQqKM",
    authDomain: "articlefiltering.firebaseapp.com",
    databaseURL: "https://articlefiltering-default-rtdb.firebaseio.com",
    projectId: "articlefiltering",
    storageBucket: "articlefiltering.appspot.com",
    messagingSenderId: "820326999222",
    appId: "1:820326999222:web:0ee11c6b9dcb9ef5937217"
};
firebase.initializeApp(firebaseConfig);
var database = firebase.database();


var projectsRef = database.ref("projects");
projectsRef.on("value", function(snapshot) {
  var projects = snapshot.val();
  var countries = {};
  for (var project in projects) {
    var location = projects[project].location;
    if (!countries[location]) {
      countries[location] = [];
    }
    countries[location].push(project);
  }

  var election = new Datamap({
    scope: 'world',
    element: document.getElementById('container1'),
    projection: 'mercator',
    fills: {
      defaultFill: '#AED6F1',/*'#c6c5d4',*/
      lt50: '#85C1E9',/*'#716b94',*/
      gt50: 'orange',
      gradient: 'url(#gradient)',
      darkblue50: '#DCFAFF',
    },
    data: {},
    geographyConfig: {
    popupTemplate: function(geography, data) {
        var name = geography.id;
        var fullname = geography.properties.name;
        var image = "images/default.jpg";
        var projectList = "";
        if (countries[name]) {
            projectList = "<ul>";
            for (var i = 0; i < countries[name].length; i++) {
                projectList += "<li>" + projects[countries[name][i]].title + "</li>"; //remove the 'projects' and ".title" from this line ie replace with countries[name][i] in order to show the project key instead of the title
            }
            projectList += "</ul>";
        }
        
        switch(name) {
            default:
                image = null;
        }
        return '<div class="hoverinfo">' +
            fullname + '<br>' +
            (image ? '<img src="'+ image +'" width="150px"></img>' : '') +
            projectList +
            '</div>';
        
    },

      hideAntarctica: true,
      borderWidth: .2,
      borderOpacity: 1,
      borderColor: '#85C1E9',/*'#c6c5d4',*/
      highlightFillColor: '#A3E4D7',/*'#14044d',*/
      highlightBorderColor: '#76D7C4',
      highlightBorderWidth: .2,
      highlightBorderOpacity: 1,
      popupOnHover: true,
    },
  });
    
    /*This section below works fine for the first popup--add back in if needed
 d3.selectAll("path")
    .on("click", function(d) {
        var popup = d3.select('.hoverinfo');
        var isShowing = popup.classed("show");
        popup.classed("show", !isShowing);
    });
    */
election.svg.selectAll("path").on("click", function(d) {
    var id = d3.select(this).attr("class").split(" ")[1];
    openClickbox(id, countries);
});

    d3.selectAll('.datamaps-subunit')
        .attr('class', d => `country-path ${d.id}`);
    
//update the map with the projects data
  for (var country in countries) {
    election.updateChoropleth({
      [country]: {
        fillKey: "lt50"
      }
    });
  }
});

d3.select('#container1').on('click', function() {
    var popup = d3.select('.hoverinfo');
    popup.node().classList.remove("show");
});
d3.select('.hoverinfo').on('click', function() {
    event.stopPropagation();
});


    

  


// create a new function to open the clickbox
function openClickbox(id) {
    console.log("openClickbox function called for country: " + id);
    var clickbox = d3.select('.clickbox');
    var projectList = "<ul>";
    var filteredProjects = firebase.database().ref("projects").orderByChild("location").equalTo(id);
    filteredProjects.once("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var project = childSnapshot.val();
            console.log("Project " + childSnapshot.key + ":", project);
            if (project.title && project.link) {
                projectList += "<li>" + '<a href="'+ project.link+'" title="'+ project.blurb +'">' + project.title + "</a></li>" +"<sub>" + project.blurb + "</sub><br><br>";
            } else {
                projectList += "<li>" + project.title + "</li>" +"<sub>" + project.blurb + "</sub><br><br>";
            }
        });
        projectList += "</ul>";
        clickbox.html(projectList);
        var closeButton = clickbox.append("button").classed("close-button", true).text("X");
        closeButton.on("click", closeClickbox);
        // show the clickbox
        clickbox.style('display', 'block');
    });
}

/*
clickbox.style('top', '10px')
        .style('left', '10px')
        .style('width', '300px')
*/















// create a new function to close the clickbox
function closeClickbox() {
    var clickbox = d3.select('.clickbox');
    clickbox.style('display', 'none');
}


// add a click event listener to each country path to open the clickbox
d3.selectAll(".country-path").each(function() {
  d3.select(this).on("click", function(d) {
    console.log("Country path clicked!");
    var id = d3.select(this).attr("class").split(" ")[1];
    openClickbox(id, projects);
  });
});


// add a click event listener to the close button to close the clickbox
d3.select('.close-button').on('click', closeClickbox);





/*
//BELOW IS THE ORIGINAL DARKMODE LINK
         // Add a click event listener to the Dark Mode link
document.getElementById('dark-mode-link').addEventListener('click', function() {
  // Toggle the 'dark-mode' class on the body
  document.body.classList.toggle('dark-mode');
});
*/


  // Select the checkbox input
  const checkbox = document.querySelector('.dark-mode-toggle__checkbox');
const clickbox = document.querySelector('.clickbox');
const hoverinfo = document.querySelector('.hoverinfo');

  // Add a change event listener to the checkbox
  checkbox.addEventListener('change', function() {
    // Check if the checkbox is checked
    if (checkbox.checked) {
      // If checked, add the 'dark-mode' class to the body
      document.body.classList.add('dark-mode');
        clickbox.classList.add('dark-mode');
        hoverinfo.classList.add('dark-mode');
    } else {
      // If not checked, remove the 'dark-mode' class from the body
      document.body.classList.remove('dark-mode');
        clickbox.classList.remove('dark-mode');
        hoverinfo.classList.remove('dark-mode');
    }
  });

/*
//BELOW IS FOR THE DROPDOWN FILTER ADDITIONS
document.addEventListener("DOMContentLoaded", function(){
    const categorySelect = document.querySelector("#category-select");
    const cryptoSelect = document.querySelector("#crypto-select");
    let projects = [];

    // Populate the select options with the unique category and crypto values
firebase.database().ref("projects").once("value", function(snapshot) {
  const categories = new Set();
  const cryptos = new Set();
  snapshot.forEach(function(childSnapshot) {
    const project = childSnapshot.val();
    projects.push(project);
    if(project.category) categories.add(project.category);
    if(project.crypto) cryptos.add(project.crypto);
  });
  console.log("Categories:", Array.from(categories));
  console.log("Cryptos:", Array.from(cryptos));
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.text = category;
    categorySelect.appendChild(option);
  });
  cryptos.forEach(crypto => {
    const option = document.createElement("option");
    option.value = crypto;
    option.text = crypto;
    cryptoSelect.appendChild(option);
  });
});


    // Add change event listeners to the select elements
    console.log(categorySelect);
console.log(cryptoSelect);
    categorySelect.addEventListener("change", handleFilterChange);
    cryptoSelect.addEventListener("change", handleFilterChange);
});


function handleFilterChange(event) {
// Get the selected category and crypto values
const category = categorySelect.value;
const crypto = cryptoSelect.value;

// Use the selected values to filter the projects
const filteredProjects = projects.filter(function(project) {
if (category !== "All" && project.category !== category) {
return false;
}
if (crypto !== "All" && project.crypto !== crypto) {
return false;
}
return true;
});


// Update the map with the filtered projects
map.updateChoropleth(filteredProjects);
}
*/


//BELOW IS FOR THE FORM BUTTON ADDER

document.addEventListener("DOMContentLoaded", function(){
  const addButton = document.querySelector("#add-button");
  const addForm = document.querySelector("#add-form");
  addButton.addEventListener("click", function(){
    addForm.style.display = addForm.style.display === "block" ? "none" : "block";
  });

  document.querySelector("#add-form").addEventListener("submit", function(e) {
    e.preventDefault(); 
    /*const key = document.querySelector("#key").value;*/
    const title = document.querySelector("#title").value;
    const location = document.querySelector("#location").value;
    const link = document.querySelector("#link").value;
    const blurb = document.querySelector("#blurb").value;

    if(title.trim() !== ""){
      const newProject = {
        /*key: key,*/
        title: title,
        location: location,
        link: link,
        blurb: blurb
      };
      firebase.database().ref("projects").push(newProject);
    }
    /*addForm.style.display = "none";*/
    addForm.reset();
  });

});

//Close the form button when clicking the X
/*document.addEventListener("DOMContentLoaded", function(){
  const addButton = document.querySelector("#add-button");
  addButton.addEventListener("click", showPopup);
  document.addEventListener("click", function(e) {
    if (!e.target.closest("#add-form")) {
        document.querySelector("#add-form").classList.add("hidden");
    }
  });
});

function showPopup() {
  document.querySelector("#add-form").classList.remove("hidden");
}
*/





/*Below are all of the customization options
var defaultOptions = {
    scope: 'world', //currently supports 'usa' and 'world', however with custom map data you can specify your own
    setProjection: setProjection, //returns a d3 path and projection functions
    projection: 'equirectangular', //style of projection to be used. try "mercator"
    height: null, //if not null, datamaps will grab the height of 'element'
    width: null, //if not null, datamaps will grab the width of 'element'
    responsive: false, //if true, call `resize()` on the map object when it should adjust it's size
    done: function() {}, //callback when the map is done drawing
    fills: {
      defaultFill: '#ABDDA4' //the keys in this object map to the "fillKey" of [data] or [bubbles]
    },
    dataType: 'json', //for use with dataUrl, currently 'json' or 'csv'. CSV should have an `id` column
    dataUrl: null, //if not null, datamaps will attempt to fetch this based on dataType ( default: json )
    geographyConfig: {
        dataUrl: null, //if not null, datamaps will fetch the map JSON (currently only supports topojson)
        hideAntarctica: true,
        borderWidth: 1,
        borderOpacity: 1,
        borderColor: '#FDFDFD',
        popupTemplate: function(geography, data) { //this function should just return a string
          return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong></div>';
        },
        popupOnHover: true, //disable the popup while hovering
        highlightOnHover: true,
        highlightFillColor: '#FC8D59',
        highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
        highlightBorderWidth: 2,
        highlightBorderOpacity: 1
    },
    
  };*/
