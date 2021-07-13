"use strict"
//vueapp
var app = new Vue({
    el: '#app',
    data:{
     headline: 'Route Muenster',
     predefinedroute: calculate(route, polygon),
     polygonarray2json: arraytogeojson(polygon),
     routearray2json: arraytogeojson(route),
     //
     inputroute:null
     //
    },  
    //
    methods:{
      selectedFile() {
        console.log('selected a file');
        console.log(this.$refs.myFile.files[0]);
        
        let file = this.$refs.myFile.files[0];
        if(!file || file.type !== 'application/json') return;
        
        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        
        reader.onload =  evt => {
          let text = evt.target.result;
          try {
            //this.inputroute...
            this.input.route = JSON.parse(text);

            //
            //new array 

            //

          } catch(e) {
            alert("Sorry, your file doesn't appear to be valid JSON data.");
          }
        }
        
        reader.onerror = evt => {
          console.error(evt);
        }
        
      }
    }
    //
})


//methods

//Methode build table +calculate distances

function calculate(r, p) {
//initialsum of the distances
let Summeausserhalb=0
let Summepolygon=0
//Poligoncorners

let p_lonleft=polygon[0][0]
let p_lonright=polygon[2][0]
let p_latdown=polygon[0][1]
let p_latup=polygon[2][1]

//Tablecontent
var table='';
//Table head
table+='<tr>'
   table+= '<th>'+"Streckenabschnitt"+'</th>'
   table+='<th>'+"Start-Koordinate"+'</th>'
   table+='<th>'+"Ziel-Koordinate"+'</th>'
   table+='<th>'+"Strecke"+'</th>'
   table+='<th>'+"Streckenposition"+'</th>'
  table+='</tr>'

//new 2d array for distance and bool values

let distancetextarray=[];



//determine coordinate neighbor
for (let i = 0; i < route.length-1; i++) {
    //startpoint 
   let lon1=route[i][0]
   let lat1=route[i][1]
//endpoint
   let lon2=route[i+1][0]
  let lat2=route[i+1][1]
  
  
  
  //Distance from coordinate to coordinate
  let EntfernungAB = distance(lat1, lon1, lat2, lon2)
 
  let text
//decision  if coordinate is in quad
  if(lat1>=p_latdown && lat1<=p_latup && lon1 >=p_lonleft && lon1 <=p_lonright){
  text ="Strecke im Rechteck"
  let Ausgabeimpolygon = distance(lat1, lon1, lat2, lon2)
  Summepolygon=Summepolygon+Ausgabeimpolygon

}
else{
  text ="Strecke außerhalb des Rechtecks"
  let Ausgabeausserhalb = distance(lat1, lon1, lat2, lon2)
  Summeausserhalb=Summeausserhalb+Ausgabeausserhalb
}
//fill new 2d array of distance and inside/outside quad
distancetextarray[i] = [];
distancetextarray[i][0]=text;
distancetextarray[i][1]=EntfernungAB;


//Tablecontent
    table +='<tr>'
    table +='<td>'+(i+1)+'</td>'
    //startpoint of distancepart
    table +='<td>'+lon1+" | "+lat1+'</td>'
    //endpoint of distancepart
    table +='<td>'+lon2+" | "+lat2+'</td>'
    //distance of the part
    table +='<td>'+EntfernungAB+'</td>';
    //Text in quad/not in quad
    table +='<td>'+text+'</td>';
    table +='</tr>'
  }
  //outside the loop
  
  //partdistancearray
var Teilstreckenarray=[]
var j=0
Teilstreckenarray[j]=0
let z=0
for(z ; z < distancetextarray.length-1; z++) {
  
if(distancetextarray[z][0]==distancetextarray[z+1][0]){
  Teilstreckenarray[j]=Teilstreckenarray[j]+distancetextarray[z][1]
  }
  else{
    Teilstreckenarray[j]=Teilstreckenarray[j]+distancetextarray[z][1]
    document.write((j+1)+". Teilstrecke: "+Teilstreckenarray[j]+"<br>")
    Teilstreckenarray.length=Teilstreckenarray.length+1
    j=j+1
    Teilstreckenarray[j]=0
    
  }

}



//last value is not comparable:  last value== index(z+1) out of bound

document.write((j+1)+". Teilstrecke: "+(Teilstreckenarray[j]+distancetextarray[z][1])+"<br>")
document.write("Strecke insgesamt im Rechteck: "+Summepolygon+"m"+'<br>')
document.write("Stecke insgesamt außerhalb des Rechtecks: "+Summeausserhalb+"m")
//Sort
document.write('<p>'+"Betätige den Knopf um die Strecken aufsteigend zu sortieren:"+'</p>')
document.write('<p>'+'<button onclick="sortTable()">'+"Sortierung"+'</button>'+'</p>')
//open/Close table
document.write('<table id="myTable" border=1>'+table+'</table>')
}

//print end
//Methods
//calculate distance of tow coordinates
/**
 * 
 * @param {number} lat1 first latitude
 * @param {number} lon1 first longitude
 * @param {number} lat2 second latitut
 * @param {number} lon2 second longitude
 * @returns 
 */
 function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
    
    return (12742 * Math.asin(Math.sqrt(a)))*1000; // 2 * R; R = 6371 km
  }

  /**
 * Tablesort by distance
 */
function sortTable() {
    var table1, rows, switching, i, x, y, shouldSwitch;
    table1 = document.getElementById("myTable");
    switching = true;
    /*Make a loop that will continue until
    no switching has been done:*/
    while (switching) {
      //start by saying: no switching is done:
      switching = false;
      rows = table1.rows;
      /*Loop through all table rows (except the
      first, which contains table headers):*/
      for (i = 1; i < (rows.length - 1); i++) {
        //start by saying there should be no switching:
        shouldSwitch = false;
        /*Get the two elements you want to compare,
        one from current row and one from the next:*/
        x = rows[i].getElementsByTagName("TD")[3];
        y = rows[i + 1].getElementsByTagName("TD")[3];
        //check if the two rows should switch place:
        if (Number(x.innerHTML) > Number(y.innerHTML)) {
          //if so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
      if (shouldSwitch) {
        /*If a switch has been marked, make the switch
        and mark that a switch has been done:*/
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }
  
//--------------------------------------------------------------------------------------------
//Method transform array to Jsonstring

//method
/**
 * 
 * @param {array with coordinates} geojson 
 */
function arraytogeojson(geojson){
  let finishpoint=geojson.length-1
  //check if polygon or route
  if(geojson[0][0]==geojson[finishpoint][0] && geojson[0][1]==geojson[finishpoint][1]){
    var geometrytype="Polygon"
  }
  else {
    geometrytype="LineString"
  }
  //Geojson structure
  var geojson =
     {
      "type":"FeatureCollection",
      "features":[
        {
          "type":"Feature",
          "properties:":{},
          "geometry":{
            "type":geometrytype,
            "coordinates":geojson},
      }]};
    
  //print as string
      var myJsonString = JSON.stringify(geojson);
      document.write('<h4>'+geometrytype+" im Json Format:"+'</h4>')
      document.write(myJsonString)
    }

 