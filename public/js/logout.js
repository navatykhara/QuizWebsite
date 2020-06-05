document.getElementById("save").addEventListener("click", saveEvent);
document.getElementById("logout").addEventListener("click", logoutEvent);

//When save is clicked, send a request to update the user's privacy
function saveEvent(){
	let xmlHTTPrequest = new XMLHttpRequest();
	xmlHTTPrequest.onreadystatechange = function() {
			if(this.readyState==4 && this.status == 200){
				console.log("It works!");
			}
		}
	
	xmlHTTPrequest.open("POST", "/privacy");
	xmlHTTPrequest.setRequestHeader("Content-Type", "application/json");
	let value;
	//Check the value of the radio buttons to see what was clicked
	for(var i = 0; i < 2; i++){
		if(document.getElementsByName("onoff")[i].checked){
			value = document.getElementsByName("onoff")[i].value;
		}
		console.log(document.getElementsByName("onoff")[i]);

		
	}
	console.log(value);
	//Send the value
	xmlHTTPrequest.send(JSON.stringify({
		privacy: value
	}));
	
	
}
//Make a request to log out then if successful redirect to home page
function logoutEvent(){
	let xmlHTTPrequest = new XMLHttpRequest();
	xmlHTTPrequest.onreadystatechange = function() {
			if(this.readyState==4 && this.status == 200){
				console.log(xmlHTTPrequest.responseText);
				window.location.href = "/";
			}
		}
	
	xmlHTTPrequest.open("GET", "/logout");	
	xmlHTTPrequest.send();
}