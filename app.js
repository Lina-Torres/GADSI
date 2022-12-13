
// 1. invocamos a express y multer 
const express = require("express");
const app = require("express")();
const multer = require("multer");

// configuramos multer se indica carpeta destino y nombre original del archivo a subir
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "archivos/")
    }, 
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer ({storage});


// 2. seteamos urlencoded para capturar los datos del formulario;
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// 3. invocamos a dotenv

const dotenv = require("dotenv");
dotenv.config({path:"./env/.env"});

// 4. setear directorio public 

app.use("/resources", express.static("public"));
app.use("/resources", express.static(__dirname + "/public"));

// 5. establecer el motor de plantillas 

app.set("view engine", "ejs");

// 6. invocamos a bcryptjs 

const bcryptjs = require("bcryptjs");

// 7 configuracion variable de sesion 

const session = require("express-session");
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
}));

// 8. conexion de la base de datos

const connection = require("./database/db.js");
const conecction = require("./database/db.js");
const { rawListeners } = require("./database/db.js");
// const { Router } = require("express");


// 9. estableciendo las rutas

app.get("/", (req, res)=>{
    res.render("login")
});

app.get("/register", (req, res)=>{
    res.render("register")
});

app.get("/index", (req, res)=>{
    res.render("index")
});

// 10. registros usuarios 

app.post('/register', async (req, res)=>{
	const user = req.body.user;
	const name = req.body.name;
    const rol = req.body.rol;
	const pass = req.body.pass;
	let passwordHash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO users SET ?',{user:user
        , name:name, rol:rol, pass:passwordHash}, async (error, results)=>{
        if(error){
            console.log(error);   
        } else {            
			res.render("Register", {
                alert: true,
				alertTitle: "Resgistro",
				alertMessage: "¡REGISTRO EXITOSO!",
				alertIcon:'success',
				showConfirmButton: false,
				timer: 1500,
				ruta: ""
            } )

            }
	});
})

// 11. autenticacion 

app.post("/auth", async (req, res)=>{
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHash = await bcryptjs.hash(pass, 8);
    if(user && pass){
        conecction.query("SELECT * FROM users WHERE user =?", [user], async (error, results)=> {
            if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "USUARIO y/o CONTRASEÑA incorrectas",
                    alertIcon:'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: ''    
                });
            } else {
                req.session.loggedin = true;                
				req.session.name = results[0].name;

                res.render('login', {
					alert: true,
					alertTitle: "Conexión exitosa",
					alertMessage: "¡INGRESO CORRECTO!",
					alertIcon:'success',
					showConfirmButton: false,
					timer: 1500,
					ruta: 'index'
				});
            }
        })
    } 
})

// 12. cargar documentos


app.get("/index", (req, res) => {
    res.sendFile(__dirname + "/views/index.ejs")
}) 

app.post("/subir", upload.single("archivo"), (req, res) => {
    console.log(req.file)
    // res.send("archivo subio correctamente");
    res.render("index", {
        alert: true,
        alertTitle: "ENVIADO",
        alertMessage: "¡DOCUMENTO CARGADO!",
        alertIcon:'success',
        showConfirmButton: false,
        timer: 1500,
        ruta: "index#cargardocumento"
    } )
})

// 13. Ver documentos guardados 



//Destruir  la sesión para cierre de sesion 
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') 
	})
});





    app.listen(3000, (req, res)=>{
        console.log('SERVER RUNNING IN http://localhost:3000');
    });