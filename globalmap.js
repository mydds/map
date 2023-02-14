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
      defaultFill: '#E6EFF3',
      lt50: '#FFFDDC',
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
                projectList += "<li>" + countries[name][i] + "</li>";
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
      borderColor: '#A5A5A5',
      highlightFillColor: '#DCFFEF',
      highlightBorderColor: '#C1C1C1',
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
                projectList += "<li>" + project.title + " " + '<a href="'+ project.link+'" title="'+ project.blurb +'">' + '(Link)' + "</a></li>" +"<sub>" + project.blurb + "</sub><br><br>";
            } else {
                projectList += "<li> No title or link available </li>";
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







         // Add a click event listener to the Dark Mode link
document.getElementById('dark-mode-link').addEventListener('click', function() {
  // Toggle the 'dark-mode' class on the body
  document.body.classList.toggle('dark-mode');
});


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
