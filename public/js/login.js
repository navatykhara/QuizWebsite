document.getElementById("login").addEventListener("click", sendReq);

//Send a request to the server to login if the login button was clicked
function sendReq(){	
	let xmlHTTPrequest = new XMLHttpRequest();
	xmlHTTPrequest.onreadystatechange = function() {
			if(this.readyState==4 && this.status == 200){
				//If successful redirect to profile
				
				window.location.href = "/users/"+JSON.parse(this.responseText);
			}else if(this.readyState==4 && this.status == 401){
				window.location.href = "/";

				
			}
		}
	
	xmlHTTPrequest.open("POST", "/login");
	xmlHTTPrequest.setRequestHeader("Content-Type", "application/json");
	//Send the user's username and password
	xmlHTTPrequest.send(JSON.stringify({
		username : document.getElementById("username").value,
		password : document.getElementById("password").value
	}));

}
