Instructions:
npm install to install dependencies
To run server: node server.js
To initialize database: mongod --dbpath=database
			node database-initializer.js
Ensure you are in the same place

Design decision: 

All redirects are designed client side. Each button was given an event that when clicked would request something from the server. 
Pug files all include a partial page. Average score is calculated on load time to avoid over complications of storing individual scores. Instead, a total score is stored. 
