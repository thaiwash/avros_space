require("../src/main.js")
var instance = new AVROS.Serve(8080)
instance.AppInformation("Tester")
/*
{
  // name of the application
  "name": "Tester",
  // if application isnt running, AVROS will try to start it (this works only on localhost)
  // [not implemented yet]
  "startup": "3_app_information.js",
  // application icon
  "icon": "res/"+icons8-chemical-test-48.png
}
*/
