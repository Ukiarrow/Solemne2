//var wsUrl = "http://url.dominio/server.php?wsdl";//para probar de afuera.
var coords, db, lastLogin, logged = false;
var pictureSource;   // picture source
var destinationType; // sets the format of returned value
var d = new Date();
var perfil_alumno;
var location;
var map, maxlat, maxlng, minlat, minlng, minDate, dt;
var markers =[];
var dataset = [];
var dataBase = []; /* array2 */
var nxtQuery = [];/* array */;


document.addEventListener("deviceready", onDeviceReady, false);

function showAlert(msj)
{
    navigator.notification.alert(
        msj,  // message
        'UNAB',   // title
        ''    // buttonName
    );
}//fin function mensaje.

// PhoneGap is ready
function onDeviceReady() 
{
	// Do cool things here...
	document.getElementById('largeImage').src='';
	clearCache();
	pictureSource=navigator.camera.PictureSourceType;
	destinationType=navigator.camera.DestinationType;
}
      
function clearCache() 
{
	navigator.camera.cleanup();
}
 
function getImage(source) 
{
    // Retrieve image file location from specified source
	//navigator.camera.getPicture(uploadPhoto, onFail, { quality: 50,
    //destinationType: Camera.DestinationType.DATA_URL, sourceType: source});	//destinationType: navigator.camera.DestinationType.FILE_URI
    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.FILE_URI });      
}
    
function onFail(message) {

    clearCache();
	//alert('Captura Descartada.');
	showAlert('Captura Descartada.'+ message);	
}
 
function uploadPhoto(imageURI) 
{
	var largeImage = document.getElementById('largeImage');
	largeImage.style.display = 'block';
	largeImage.src ="data:image/jpeg;base64," + imageURI;
}
/*
function enviaFoto()
{
	var user=document.getElementById('user').value;
	var fotoSrc=document.getElementById('largeImage').src;
	
	if(user=='' || fotoSrc=='')
	{
		showAlert('Debe Ingresar los valores!');
	}
	else
	{
	  //var fotoCod=encodeImageFileAsURL(foto);

            $.ajax({
            cache: false,
            // puede ser GET, POST
            type: "POST",  							
            // Tipo de retorno
            dataType: "html",
            // pagina php que recibe la llamada
            url: "http://72.14.183.67/ws/foto.php",  							
            // datos, ej: $_POST['data']
            data: {
                    user:user,
                    foto:fotoSrc				
            },
            //beforeSend: function(){  
            //    document.getElementById('divCargando').style.display="block";
            //    $("#labelCargando").html('Cargando...');	
            //},
            // acciones cuando me retorna algo el PHP
            success: function( msg){
                   console.log(msg);
                    if(msg=='1')
                    {
                        showAlert('Ha ocurrido un Error. Archivo ya existe!');
                    }
                    else
                    {
                        showAlert('Foto Subida!.');

                    }
            },							
            // acciones cuando hay error en comunicacion el el php
            error: function(xhr, status,msg2 ){
                    //alert('4');			
                    console.log(xhr);
            }
            });//fin ajax
	
        }
}
*/
//iniciar sesion
$('#login').click(()=>{
    $.ajax({
        type: 'POST',
        url: ' http://72.14.183.67/ws/s2/perfil.php',
        data: {
            //user: $('#username').val(),
            //passwd: $('#password').val()
             foto: $('#largeImage').val(),
             nombres: $('#nombres').val(),
             apellidos: $('#apellidos').val(),
             rut: $('#rut').val(),
             edad: $('#edad').val(),
             sexo: $('#sexo').val(),
             email: $('#email').val(),
             fono: $('#fono').val(),
             carrera: $('#carrera').val(),
             coordenadas: location,
             fecha_creacion: $('#tiempoM').val()
        },
        success: function(response){
            var respuesta = JSON.parse(response);
            if (respuesta.estado == true) {
                db = sqlitePlugin.openDatabase('T2_S2.db', '1.0', '', 1);
                db.transaction(function (txn) {
                    tx.executeSql("DROP TABLE IF ⁄EXISTS alumno");
                    tx.executeSql("CREATE TABLE IF NOT EXISTS alumno (foto BLOB, nombres TEXT, apellidos TEXT, edad INTEGER, rut TEXT, sexo TEXT, email TEXT, fono TEXT, carrera TEXT, coordenadas TEXT, fecha_creacion DATETIME)");
                    tx.executeSql("INSERT INTO alumno  (foto, nombres, apellidos, edad, rut, sexo, email, fono, carrera, coordenadas, fecha_creacion) VALUES (?,?,?,?,?,?,?,?,?,?,?)", ["unab", "unab.,2018", lastConnection, 1], function(tx, res){
                        console.log(res.insertId);
                    });
                /*getQR();
                var lastConnection = new Date().getTime();
                db.transaction(function(tx){
                    tx.executeSql("INSERT INTO alumno  (user, password, fechalogin, status) VALUES (?,?,?,?)", ["unab", "unab.,2018", lastConnection, 1], function(tx, res){
                        console.log(res.insertId);
                    });
                });
                console.log("Registo exitoso, pasando al scanner...");
                window.location.href = "scan.html";
                */
                    perfil_alumno = perfil_alumno.concat("http://72.14.183.67/ws/s2/archivos/",rut,".html");
                    showAlert(respuesta.msj);
                    getQR(perfil_alumno);

                });
            } else {
                 showAlert(respuesta.msj);
            }
        },
        error: function(respuesta){
            showAlert("Fallo conexión");
        }
    });
});

document.addEventListener('deviceready', function(){
    db = sqlitePlugin.openDatabase({
        name: 'T2_S2.db',
        location: 'default',
    });
    db.transaction(function(tx){
        tx.executeSql("DROP TABLE IF ⁄EXISTS alumno");
        tx.executeSql("CREATE TABLE IF NOT EXISTS alumno (id_alumno integer primary key autoincrement,foto BLOB, nombres TEXT, apellidos TEXT, edad INTEGER, rut TEXT, sexo TEXT, email TEXT, fono TEXT, carrera TEXT, coordenadas TEXT, fecha_creacion DATETIME)");
        
    }, function(error){
        console.log(error.message);
    }, function(success){
        var actualDate = new Date();
        var maxDate = new Date(actualDate);
        maxDate.setMinutes(actualDate.getMinutes() - 15);
        var dateInalumno = new Date(parseInt(lastLogin.fechalogin));
        if((lastLogin == '') || (dateInalumno >= maxDate && lastLogin.status == 1) ){
            db.transaction(function(tx){
                tx.executeSql("UPDATE alumno SET status = ? WHERE id = ?", [0, lastLogin.id], function(tx, res){
                   console.log(res.insertId) 
                });
            });
            alumno = true;
            window.location.href = 'scan.html';
        } else {
            alumno = false;
            db.transaction(function(tx){
                tx.executeSql("SELECT * FROM alumno WHERE ID = (SELECT MAX(ID) FROM alumno)", [], function(tx, res){
                    console.log(res.rows.item(0));
                });
            });
        }
    });

    var bgGeo = window.BackgroundGeolocation;
    var callbackSuccess = function(location){
        coords = '{latitude:'+ location.coords.latitude+', longitude:'+ location.coords.longitude+'}';
    }
    var onError = function(errorCode){
        console.log(errorCode);
    }
}, false);

function getQR(perfil) {
    $.ajax({
        type: 'POST',
        url: 'http://72.14.183.67/ws/s2/qr.php ',
        data: {
            user: $('#rut').val(),
            qr: perfil
        },
        success: function(response){
            var respuesta = JSON.parse(response);
            if (respuesta.estado == true) {
                showAlert(respuesta.msj)
            } else {
                 showAlert(respuesta.msj);
            }
        },
        error: function(respuesta){
            showAlert("Fallo conexión");
        }
    });
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -33.4726900, lng: -70.6472400},
        zoom: 15
    })
    var geocoder = new google.maps.Geocoder();
    document.getElementById('btnSearch').addEventListener('click', function(){
        changeAddress(geocoder, map);
    });
    
    
};

function changeAddress(geocoder, map) {
    var address = document.getElementById('address').value;
    geocoder.geocode({'address': address }, function(results, status){
        if(status === 'OK') {
            $('.searchAddressDisplay').css('display', 'none');
            $('.searchAddressAgain').css('display', 'block');
            $('.searchIntensityDisplay').css('display', 'block');
            $('.searchIntensityAgain').css('display', 'none');
            map.setCenter(results[0].geometry.location);
            markers.push(new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            }));
            maxlat = ( results[0].geometry.location.lat() + 1); 
            maxlng = ( results[0].geometry.location.lng() + 1); 
            minlat = ( results[0].geometry.location.lat() - 1); 
            minlng = ( results[0].geometry.location.lng() - 1); 
            location = results[0].geometry.location;
        } else {
            console.log('Fallo ' + status);
        }
    });
}

function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
}

function clearMarkers() {
    setMapOnAll(null);
}